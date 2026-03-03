import { useEffect, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import {
    WebClientClient,
    type Telemetry,
    type RealtimeListenResponseOfListOfTelemetry,
} from "../generated-ts-client";

const API_BASE = "http://localhost:5117";
const sse = new StateleSSEClient(`${API_BASE}/api/WebClient/sse`);
const restClient = new WebClientClient(API_BASE);

export function useRealtimeTelemetry(
    farmId?: string,
    turbineId?: string,
    take: number = 200
) {
    const [telemetry, setTelemetry] = useState<Telemetry[]>([]);

    useEffect(() => {
        return sse.listen(
            async (connectionId) => {
                const result = await restClient.getTelemetry(connectionId, farmId ?? null, turbineId ?? null, take);
                // Make sure we render immediately from initial snapshot
                setTelemetry(result.data ?? []);
                return result; // IMPORTANT: return the whole { group, data }
            },
            (payload: any) => {
                if (Array.isArray(payload)) {
                    setTelemetry(payload as Telemetry[]);
                    return;
                }

                const maybe = payload as RealtimeListenResponseOfListOfTelemetry;
                if (Array.isArray(maybe?.data)) {
                    setTelemetry(maybe.data);
                }
            }
        );
    }, [farmId, turbineId, take]);

    return telemetry;
}