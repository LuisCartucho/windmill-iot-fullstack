import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Alert,
    type RealtimeListenResponseOfListOfAlert,
} from "../generated-ts-client";

const API_BASE = "http://localhost:5117";
const sse = new StateleSSEClient(`${API_BASE}/api/WebClient/sse`);
const restClient = new WebClientClient(API_BASE);

export function useRealtimeAlerts(
    farmId?: string,
    turbineId?: string,
    take: number = 200
) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        return sse.listen(
            async (connectionId) => {
                const result = await restClient.getAlerts(connectionId, farmId ?? null, turbineId ?? null, take);
                setAlerts(result.data ?? []);
                return result;
            },
            (payload: any) => {
                if (Array.isArray(payload)) {
                    setAlerts(payload as Alert[]);
                    return;
                }

                const maybe = payload as RealtimeListenResponseOfListOfAlert;
                if (Array.isArray(maybe?.data)) {
                    setAlerts(maybe.data);
                }
            }
        );
    }, [farmId, turbineId, take]);

    return alerts;
}