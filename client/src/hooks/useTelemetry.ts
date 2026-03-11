import { useEffect, useRef, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Telemetry,
    type RealtimeListenResponseOfTelemetry,
} from "../generated-ts-client";

type LatestResponse = RealtimeListenResponseOfTelemetry;

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const DEFAULT_TAKE = 60;

const telemetryCache = new Map<string, Telemetry[]>();

function normalizeTurbineId(value?: string | null) {
    if (!value) return "";
    const v = value.trim().toLowerCase();
    return v.startsWith("turbine-") ? v : `turbine-${v}`;
}

function cacheKey(farmId?: string, turbineId?: string, take?: number) {
    return `${farmId ?? "all"}::${normalizeTurbineId(turbineId) || "all"}::${take ?? DEFAULT_TAKE}`;
}

function telemetryKey(t: Telemetry) {
    return [
        t.farmId ?? "",
        normalizeTurbineId(t.turbineId),
        t.timestamp ?? "",
    ].join("|");
}

function dedupeTelemetry(items: Telemetry[]) {
    const map = new Map<string, Telemetry>();

    for (const t of items) {
        map.set(telemetryKey(t), t);
    }

    return Array.from(map.values()).sort((a, b) => {
        const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
        const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
        return ta - tb;
    });
}

export function useTelemetry(
    farmId?: string,
    turbineId?: string,
    take: number = DEFAULT_TAKE
) {
    const [rows, setRows] = useState<Telemetry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestIdRef = useRef(0);
    const stopRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!API_BASE) {
            setError("VITE_API_BASE is missing");
            setIsLoading(false);
            return;
        }

        if (!turbineId) {
            stopRef.current?.();
            stopRef.current = null;
            setRows([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        stopRef.current?.();
        stopRef.current = null;

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        const selectedTurbine = normalizeTurbineId(turbineId);
        const key = cacheKey(farmId, turbineId, take);
        const cached = telemetryCache.get(key);

        setRows(cached ?? []);
        setIsLoading(!cached);
        setError(null);

        let disposed = false;
        const abortController = new AbortController();

        const initialApi = new WebClientClient(API_BASE, {
            fetch: (url, init) =>
                window.fetch(url, {
                    ...init,
                    signal: abortController.signal,
                }),
        });

        const liveApi = new WebClientClient(API_BASE);

        void (async () => {
            try {
                const initial = await initialApi.getTelemetry(
                    farmId ?? null,
                    turbineId ?? null,
                    take
                );

                if (disposed || requestIdRef.current !== requestId) return;

                const filtered = (initial ?? []).filter(
                    (t) =>
                        normalizeTurbineId(t.turbineId) === selectedTurbine &&
                        (!farmId || t.farmId === farmId)
                );

                const next = dedupeTelemetry(filtered).slice(-take);
                telemetryCache.set(key, next);
                setRows(next);
                setIsLoading(false);
                setError(null);
            } catch (e: any) {
                if (disposed || requestIdRef.current !== requestId) return;
                if (e?.name === "AbortError") return;

                setIsLoading(false);
                setError("Failed to load telemetry");
            }
        })();

        const sse = new StateleSSEClient(`${API_BASE}/api/WebClient/sse`);

        void Promise.resolve(
            sse.listen(
                async (connectionId) => {
                    const latest = await liveApi.getTelemetryLatest(
                        connectionId,
                        farmId ?? null,
                        turbineId ?? null
                    );

                    return {
                        group: latest?.group ?? undefined,
                        data: latest?.data ?? undefined,
                    } satisfies LatestResponse;
                },
                (payload: unknown) => {
                    if (disposed || requestIdRef.current !== requestId) return;

                    const wrapped = payload as LatestResponse | undefined;
                    const direct = payload as Telemetry | undefined;

                    const incoming: Telemetry | null =
                        wrapped?.data?.timestamp
                            ? wrapped.data
                            : direct?.timestamp
                                ? direct
                                : null;

                    if (!incoming?.timestamp) return;
                    if (normalizeTurbineId(incoming.turbineId) !== selectedTurbine) return;
                    if (farmId && incoming.farmId !== farmId) return;

                    setRows((prev) => {
                        const next = dedupeTelemetry([...prev, incoming]).slice(-take);
                        telemetryCache.set(key, next);
                        return next;
                    });

                    setIsLoading(false);
                    setError(null);
                }
            )
        )
            .then((stop) => {
                if (disposed) {
                    if (typeof stop === "function") stop();
                    return;
                }

                if (typeof stop === "function") {
                    stopRef.current = stop;
                }
            })
            .catch((err) => {
                if (disposed || requestIdRef.current !== requestId) return;
                console.error("SSE listen failed:", err);
            });

        return () => {
            disposed = true;
            abortController.abort();

            if (stopRef.current) {
                stopRef.current();
                stopRef.current = null;
            }
        };
    }, [farmId, turbineId, take]);

    return { rows, isLoading, error };
}