import { useEffect, useMemo, useRef, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Telemetry,
    type RealtimeListenResponseOfTelemetry,
} from "../generated-ts-client";

type LatestResponse = RealtimeListenResponseOfTelemetry;

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const DEFAULT_TAKE = 50;

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
    return [normalizeTurbineId(t.turbineId), t.timestamp ?? ""].join("|");
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

    useEffect(() => {
        if (!API_BASE) {
            console.error("[useTelemetry] VITE_API_BASE is missing");
            setError("VITE_API_BASE is missing");
            setIsLoading(false);
            return;
        }

        if (!turbineId) {
            console.log("[useTelemetry] no turbine selected");
            setRows([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        const selectedTurbine = normalizeTurbineId(turbineId);
        const key = cacheKey(farmId, turbineId, take);
        const cached = telemetryCache.get(key);

        console.log("[useTelemetry] mount", {
            requestId,
            farmId,
            turbineId,
            selectedTurbine,
            take,
            cacheKey: key,
            cachedCount: cached?.length ?? 0,
            apiBase: API_BASE,
        });

        setRows(cached ?? []);
        setIsLoading(!cached);
        setError(null);

        let disposed = false;
        let stopFn: (() => void) | null = null;

        const abortController = new AbortController();

        const initialApi = new WebClientClient(API_BASE, {
            fetch: (url, init) => {
                console.log("[useTelemetry] fetch()", {
                    requestId,
                    url: String(url),
                    turbineId,
                });

                return window.fetch(url, {
                    ...init,
                    signal: abortController.signal,
                });
            },
        });

        const liveApi = new WebClientClient(API_BASE);

        void (async () => {
            try {
                console.log("[useTelemetry] initial request start", {
                    requestId,
                    farmId,
                    turbineId,
                    selectedTurbine,
                    take,
                });

                const initial = await initialApi.getTelemetry(
                    farmId ?? null,
                    turbineId ?? null,
                    take
                );

                console.log("[useTelemetry] initial request done", {
                    requestId,
                    turbineId,
                    received: initial?.length ?? 0,
                    rawSample: (initial ?? []).slice(0, 3),
                });

                if (disposed || requestIdRef.current !== requestId) {
                    console.log("[useTelemetry] initial ignored due to stale request", {
                        requestId,
                        currentRequestId: requestIdRef.current,
                        disposed,
                        turbineId,
                    });
                    return;
                }

                const filtered = (initial ?? []).filter((t) => {
                    const incoming = normalizeTurbineId(t.turbineId);
                    const match = incoming === selectedTurbine;

                    if (!match) {
                        console.log("[useTelemetry] initial filtered out row", {
                            selectedTurbine,
                            rowTurbineId: t.turbineId,
                            normalizedRowTurbineId: incoming,
                            timestamp: t.timestamp,
                        });
                    }

                    return match;
                });

                const next = dedupeTelemetry(filtered);
                telemetryCache.set(key, next);
                setRows(next);
                setIsLoading(false);
                setError(null);

                console.log("[useTelemetry] initial applied", {
                    requestId,
                    turbineId,
                    selectedTurbine,
                    rawCount: initial?.length ?? 0,
                    filteredCount: filtered.length,
                    dedupedCount: next.length,
                    sample: next.slice(-3),
                });
            } catch (e: any) {
                if (disposed || requestIdRef.current !== requestId) {
                    console.log("[useTelemetry] initial error ignored due to stale request", {
                        requestId,
                        currentRequestId: requestIdRef.current,
                        disposed,
                        turbineId,
                        error: e,
                    });
                    return;
                }

                if (e?.name === "AbortError") {
                    console.log("[useTelemetry] initial aborted", {
                        requestId,
                        turbineId,
                    });
                    return;
                }

                console.error("[useTelemetry] initial fetch failed", {
                    requestId,
                    turbineId,
                    error: e,
                });

                setIsLoading(false);
                setError("Failed to load telemetry");
            } finally {
                console.log("[useTelemetry] initial request finally", {
                    requestId,
                    turbineId,
                });
            }
        })();

        const sseUrl = `${API_BASE}/api/WebClient/sse`;
        const sse = new StateleSSEClient(sseUrl);

        console.log("[useTelemetry] sse client created", {
            requestId,
            turbineId,
            sseUrl,
        });

        Promise.resolve(
            sse.listen(
                async (connectionId) => {
                    try {
                        console.log("[useTelemetry] sse connection opened", {
                            requestId,
                            turbineId,
                            connectionId,
                        });

                        const latest = await liveApi.getTelemetryLatest(
                            connectionId,
                            farmId ?? null,
                            turbineId ?? null
                        );

                        console.log("[useTelemetry] live subscribe response", {
                            requestId,
                            turbineId,
                            connectionId,
                            group: latest?.group,
                            hasData: !!latest?.data,
                            dataTurbineId: latest?.data?.turbineId,
                            dataTimestamp: latest?.data?.timestamp,
                        });

                        return {
                            group: latest?.group ?? undefined,
                            data: latest?.data ?? undefined,
                        } satisfies LatestResponse;
                    } catch (e: any) {
                        if (!disposed) {
                            console.error("[useTelemetry] live subscribe failed", {
                                requestId,
                                turbineId,
                                error: e,
                            });
                        }

                        return {
                            group: undefined,
                            data: undefined,
                        } satisfies LatestResponse;
                    }
                },
                (payload: unknown) => {
                    if (disposed || requestIdRef.current !== requestId) {
                        console.log("[useTelemetry] live payload ignored due to stale request", {
                            requestId,
                            currentRequestId: requestIdRef.current,
                            disposed,
                            turbineId,
                            payload,
                        });
                        return;
                    }

                    const wrapped = payload as LatestResponse | undefined;
                    const direct = payload as Telemetry | undefined;

                    const incoming: Telemetry | null =
                        wrapped?.data?.timestamp
                            ? wrapped.data
                            : direct?.timestamp
                                ? direct
                                : null;

                    console.log("[useTelemetry] raw live payload", {
                        requestId,
                        turbineId,
                        payload,
                        extractedIncoming: incoming,
                    });

                    if (!incoming?.timestamp) {
                        console.log("[useTelemetry] live payload skipped: no timestamp", {
                            requestId,
                            turbineId,
                            payload,
                        });
                        return;
                    }

                    const incomingTurbine = normalizeTurbineId(incoming.turbineId);
                    const match = incomingTurbine === selectedTurbine;

                    console.log("[useTelemetry] live", {
                        requestId,
                        selected: selectedTurbine,
                        incoming: incoming.turbineId,
                        incomingNormalized: incomingTurbine,
                        match,
                        timestamp: incoming.timestamp,
                    });

                    if (!match) {
                        console.log("[useTelemetry] live payload ignored: turbine mismatch", {
                            requestId,
                            selectedTurbine,
                            incomingTurbineId: incoming.turbineId,
                            incomingNormalized: incomingTurbine,
                            timestamp: incoming.timestamp,
                        });
                        return;
                    }

                    setRows((prev) => {
                        const next = dedupeTelemetry([...prev, incoming]).slice(-take);
                        telemetryCache.set(key, next);

                        console.log("[useTelemetry] live applied", {
                            requestId,
                            turbineId,
                            prevCount: prev.length,
                            nextCount: next.length,
                            lastPoint: next[next.length - 1],
                        });

                        return next;
                    });

                    setIsLoading(false);
                    setError(null);
                }
            )
        ).then((maybeStop) => {
            if (disposed) {
                console.log("[useTelemetry] sse stop received after dispose", {
                    requestId,
                    turbineId,
                });

                if (typeof maybeStop === "function") maybeStop();
                return;
            }

            if (typeof maybeStop === "function") {
                stopFn = maybeStop;
                console.log("[useTelemetry] sse stopFn registered", {
                    requestId,
                    turbineId,
                });
            } else {
                console.log("[useTelemetry] sse listen returned no stopFn", {
                    requestId,
                    turbineId,
                    value: maybeStop,
                });
            }
        });

        return () => {
            console.log("[useTelemetry] cleanup", {
                requestId,
                turbineId,
            });

            disposed = true;
            requestIdRef.current += 1;
            abortController.abort();
            stopFn?.();
        };
    }, [farmId, turbineId, take]);

    const latestByTurbine = useMemo(() => {
        const map: Record<string, Telemetry> = {};

        for (const t of rows) {
            const key = normalizeTurbineId(t.turbineId);
            if (!key) continue;
            map[key] = t;
        }

        console.log("[useTelemetry] latestByTurbine recomputed", {
            rowCount: rows.length,
            keys: Object.keys(map),
        });

        return map;
    }, [rows]);

    return { rows, latestByTurbine, isLoading, error };
}