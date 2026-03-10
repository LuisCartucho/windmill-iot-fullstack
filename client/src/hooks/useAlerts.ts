import { useEffect, useRef, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Alert,
    type RealtimeListenResponseOfAlert,
} from "../generated-ts-client";

type LatestResponse = RealtimeListenResponseOfAlert;

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const DEFAULT_TAKE = 50;

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

    useEffect(() => {
        if (!API_BASE) {
            console.error("[useAlerts] VITE_API_BASE is missing");
            setError("VITE_API_BASE is missing");
            setIsLoading(false);
            return;
        }

        if (!turbineId) {
            console.log("[useAlerts] no turbine selected");
            setAlerts([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        const selectedTurbine = normalizeTurbineId(turbineId);
        const key = cacheKey(farmId, turbineId, take);
        const cached = alertsCache.get(key);

        console.log("[useAlerts] mount", {
            requestId,
            farmId,
            turbineId,
            selectedTurbine,
            take,
            cacheKey: key,
            cachedCount: cached?.length ?? 0,
            apiBase: API_BASE,
        });

        setAlerts(cached ?? []);
        setIsLoading(!cached);
        setError(null);

        let disposed = false;
        let stopFn: (() => void) | null = null;

        const abortController = new AbortController();

        const initialApi = new WebClientClient(API_BASE, {
            fetch: (url, init) => {
                console.log("[useAlerts] fetch()", {
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
                console.log("[useAlerts] initial request start", {
                    requestId,
                    farmId,
                    turbineId,
                    selectedTurbine,
                    take,
                });

                const initial = await initialApi.getAlerts(
                    farmId ?? null,
                    turbineId ?? null,
                    take
                );

                console.log("[useAlerts] initial request done", {
                    requestId,
                    turbineId,
                    received: initial?.length ?? 0,
                    rawSample: (initial ?? []).slice(0, 3),
                });

                if (disposed || requestIdRef.current !== requestId) {
                    console.log("[useAlerts] initial ignored due to stale request", {
                        requestId,
                        currentRequestId: requestIdRef.current,
                        disposed,
                        turbineId,
                    });
                    return;
                }

                const filtered = (initial ?? []).filter((a) => {
                    const incoming = normalizeTurbineId(a.turbineId);
                    const match = incoming === selectedTurbine;

                    if (!match) {
                        console.log("[useAlerts] initial filtered out row", {
                            selectedTurbine,
                            rowTurbineId: a.turbineId,
                            normalizedRowTurbineId: incoming,
                            timestamp: a.timestamp,
                            message: a.message,
                        });
                    }

                    return match;
                });

                const next = dedupeAlerts(filtered);
                alertsCache.set(key, next);
                setAlerts(next);
                setIsLoading(false);
                setError(null);

                console.log("[useAlerts] initial applied", {
                    requestId,
                    turbineId,
                    selectedTurbine,
                    rawCount: initial?.length ?? 0,
                    filteredCount: filtered.length,
                    dedupedCount: next.length,
                    sample: next.slice(0, 3),
                });
            } catch (e: any) {
                if (disposed || requestIdRef.current !== requestId) {
                    console.log("[useAlerts] initial error ignored due to stale request", {
                        requestId,
                        currentRequestId: requestIdRef.current,
                        disposed,
                        turbineId,
                        error: e,
                    });
                    return;
                }

                if (e?.name === "AbortError") {
                    console.log("[useAlerts] initial aborted", {
                        requestId,
                        turbineId,
                    });
                    return;
                }

                console.error("[useAlerts] initial fetch failed", {
                    requestId,
                    turbineId,
                    error: e,
                });

                setIsLoading(false);
                setError("Failed to load alerts");
            } finally {
                console.log("[useAlerts] initial request finally", {
                    requestId,
                    turbineId,
                });
            }
        })();

        const sseUrl = `${API_BASE}/api/WebClient/sse`;
        const sse = new StateleSSEClient(sseUrl);

        console.log("[useAlerts] sse client created", {
            requestId,
            turbineId,
            sseUrl,
        });

        Promise.resolve(
            sse.listen(
                async (connectionId) => {
                    try {
                        console.log("[useAlerts] sse connection opened", {
                            requestId,
                            turbineId,
                            connectionId,
                        });

                        const latest = await liveApi.getAlertLatest(
                            connectionId,
                            farmId ?? null,
                            turbineId ?? null
                        );

                        console.log("[useAlerts] live subscribe response", {
                            requestId,
                            turbineId,
                            connectionId,
                            group: latest?.group,
                            hasData: !!latest?.data,
                            dataTurbineId: latest?.data?.turbineId,
                            dataTimestamp: latest?.data?.timestamp,
                            dataMessage: latest?.data?.message,
                        });

                        return {
                            group: latest?.group ?? undefined,
                            data: latest?.data ?? undefined,
                        } satisfies LatestResponse;
                    } catch (e: any) {
                        if (!disposed) {
                            console.error("[useAlerts] live subscribe failed", {
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
                        console.log("[useAlerts] live payload ignored due to stale request", {
                            requestId,
                            currentRequestId: requestIdRef.current,
                            disposed,
                            turbineId,
                            payload,
                        });
                        return;
                    }

                    const wrapped = payload as LatestResponse | undefined;
                    const direct = payload as Alert | undefined;

                    const incoming: Alert | null =
                        wrapped?.data?.timestamp
                            ? wrapped.data
                            : direct?.timestamp
                                ? direct
                                : null;

                    console.log("[useAlerts] raw live payload", {
                        requestId,
                        turbineId,
                        payload,
                        extractedIncoming: incoming,
                    });

                    if (!incoming?.timestamp) {
                        console.log("[useAlerts] live payload skipped: no timestamp", {
                            requestId,
                            turbineId,
                            payload,
                        });
                        return;
                    }

                    const incomingTurbine = normalizeTurbineId(incoming.turbineId);
                    const match = incomingTurbine === selectedTurbine;

                    console.log("[useAlerts] live", {
                        requestId,
                        selected: selectedTurbine,
                        incoming: incoming.turbineId,
                        incomingNormalized: incomingTurbine,
                        match,
                        timestamp: incoming.timestamp,
                        message: incoming.message,
                    });

                    if (!match) {
                        console.log("[useAlerts] live payload ignored: turbine mismatch", {
                            requestId,
                            selectedTurbine,
                            incomingTurbineId: incoming.turbineId,
                            incomingNormalized: incomingTurbine,
                            timestamp: incoming.timestamp,
                            message: incoming.message,
                        });
                        return;
                    }

                    setAlerts((prev) => {
                        const next = dedupeAlerts([incoming, ...prev]).slice(0, take);
                        alertsCache.set(key, next);

                        console.log("[useAlerts] live applied", {
                            requestId,
                            turbineId,
                            prevCount: prev.length,
                            nextCount: next.length,
                            firstAlert: next[0],
                        });

                        return next;
                    });

                    setIsLoading(false);
                    setError(null);
                }
            )
        ).then((maybeStop) => {
            if (disposed) {
                console.log("[useAlerts] sse stop received after dispose", {
                    requestId,
                    turbineId,
                });

                if (typeof maybeStop === "function") maybeStop();
                return;
            }

            if (typeof maybeStop === "function") {
                stopFn = maybeStop;
                console.log("[useAlerts] sse stopFn registered", {
                    requestId,
                    turbineId,
                });
            } else {
                console.log("[useAlerts] sse listen returned no stopFn", {
                    requestId,
                    turbineId,
                    value: maybeStop,
                });
            }
        });

        return () => {
            console.log("[useAlerts] cleanup", {
                requestId,
                turbineId,
            });

            disposed = true;
            requestIdRef.current += 1;
            abortController.abort();
            stopFn?.();
        };
    }, [farmId, turbineId, take]);

    return { alerts, isLoading, error };
}