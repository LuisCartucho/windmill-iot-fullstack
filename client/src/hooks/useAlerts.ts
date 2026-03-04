import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Alert,
    type RealtimeListenResponseOfListOfAlert,
} from "../generated-ts-client";

type RealtimeResponse = RealtimeListenResponseOfListOfAlert;

// IMPORTANT: Set this in .env.development and .env.production
const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

export function useRealtimeAlerts(
    farmId?: string,
    turbineId?: string,
    take: number = 200
) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        if (!API_BASE) {
            console.error(
                "VITE_API_BASE is missing. Set it in .env.production and rebuild/redeploy."
            );
            return;
        }

        const sse = new StateleSSEClient(`${API_BASE}/api/webclient/sse`);
        const restClient = new WebClientClient(API_BASE);

        return sse.listen(
            async (connectionId) => {
                const result = await restClient.getAlerts(
                    connectionId,
                    farmId ?? null,
                    turbineId ?? null,
                    take
                );

                setAlerts(result.data ?? []);
                return result;
            },
            (payload: any) => {
                if (Array.isArray(payload)) {
                    setAlerts(payload as Alert[]);
                    return;
                }

                const maybe = payload as RealtimeResponse;
                if (Array.isArray(maybe?.data)) {
                    setAlerts(maybe.data);
                }
            }
        );
    }, [farmId, turbineId, take]);

    return alerts;
}