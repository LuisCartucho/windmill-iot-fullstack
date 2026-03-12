import { useEffect, useRef, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Alert,
    type RealtimeListenResponseOfAlert,
} from "../generated-ts-client";

type LatestResponse = RealtimeListenResponseOfAlert;

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const DEFAULT_TAKE = 20;

const alertsCache = new Map<string, Alert[]>();

function normalizeTurbineId(value?: string | null) {
    if (!value) return "";
    const v = value.trim().toLowerCase();
    return v.startsWith("turbine-") ? v : `turbine-${v}`;
}

function cacheKey(farmId?: string, turbineId?: string, take?: number) {
    return `${farmId ?? "all"}::${normalizeTurbineId(turbineId) || "all"}::${take ?? DEFAULT_TAKE}`;
}

function alertKey(a: Alert) {
    return [
        normalizeTurbineId(a.turbineId),
        a.severity ?? "",
        a.message ?? "",
        a.timestamp ?? "",
    ].join("|");
}

function dedupeAlerts(items: Alert[]) {
    const map = new Map<string, Alert>();

    for (const a of items) {
        map.set(alertKey(a), a);
    }

    return Array.from(map.values()).sort((a, b) => {
        const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
        const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
        return tb - ta;
    });
}

export function useAlerts(
    farmId?: string,
    turbineId?: string,
    take: number = DEFAULT_TAKE
) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestIdRef = useRef(0);
    const stopRef = useRef<(() => void) | null>(null);
    const sseRef = useRef<StateleSSEClient | null>(null);

    useEffect(() => {
        if (!API_BASE) {
            setError("VITE_API_BASE is missing");
            setIsLoading(false);
            return;
        }

        if (!sseRef.current) {
            sseRef.current = new StateleSSEClient(`${API_BASE}/api/WebClient/sse`);
        }

        if (!turbineId) {
            if (stopRef.current) {
                stopRef.current();
                stopRef.current = null;
            }

            setAlerts([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        if (stopRef.current) {
            stopRef.current();
            stopRef.current = null;
        }

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        const selectedTurbine = normalizeTurbineId(turbineId);
        const key = cacheKey(farmId, turbineId, take);
        const cached = alertsCache.get(key);

        setAlerts(cached ?? []);
        setIsLoading(!cached);
        setError(null);

        let disposed = false;
        let localStop: (() => void) | null = null;

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
                const initial = await initialApi.getAlerts(
                    farmId ?? null,
                    turbineId ?? null,
                    take
                );

                if (disposed || requestIdRef.current !== requestId) return;

                const filtered = (initial ?? []).filter(
                    (a) => normalizeTurbineId(a.turbineId) === selectedTurbine
                );

                const next = dedupeAlerts(filtered).slice(0, take);
                alertsCache.set(key, next);
                setAlerts(next);
                setIsLoading(false);
                setError(null);
            } catch (e: any) {
                if (disposed || requestIdRef.current !== requestId) return;
                if (e?.name === "AbortError") return;

                setIsLoading(false);
                setError("Failed to load alerts");
            }
        })();

        void Promise.resolve(
            sseRef.current.listen(
                async (connectionId) => {
                    const latest = await liveApi.getAlertLatest(
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
                    const direct = payload as Alert | undefined;

                    const incoming: Alert | null =
                        wrapped?.data?.timestamp
                            ? wrapped.data
                            : direct?.timestamp
                                ? direct
                                : null;

                    if (!incoming?.timestamp) return;
                    if (normalizeTurbineId(incoming.turbineId) !== selectedTurbine) return;

                    setAlerts((prev) => {
                        const next = dedupeAlerts([incoming, ...prev]).slice(0, take);
                        alertsCache.set(key, next);
                        return next;
                    });

                    setIsLoading(false);
                    setError(null);
                }
            )
        )
            .then((stop) => {
                if (disposed || requestIdRef.current !== requestId) {
                    if (typeof stop === "function") stop();
                    return;
                }

                if (typeof stop === "function") {
                    localStop = stop;
                    stopRef.current = stop;
                }
            })
            .catch((err) => {
                if (disposed || requestIdRef.current !== requestId) return;
                console.error("Alerts SSE listen failed:", err);
            });

        return () => {
            disposed = true;
            abortController.abort();

            if (localStop) {
                localStop();
            } else if (stopRef.current) {
                stopRef.current();
            }

            if (stopRef.current === localStop) {
                stopRef.current = null;
            }
        };
    }, [farmId, turbineId, take]);

    return { alerts, isLoading, error };
}