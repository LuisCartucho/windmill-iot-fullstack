import { useEffect, useMemo, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import type {
    Telemetry,
    RealtimeListenResponseOfListOfTelemetry,
} from "../generated-ts-client";

type RealtimeResponse = RealtimeListenResponseOfListOfTelemetry;

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

export function useFarmTelemetry(
    farmId?: string,
    turbineId?: string,
    take: number = 500
) {
    const [rows, setRows] = useState<Telemetry[]>([]);

    useEffect(() => {
        if (!API_BASE) {
            console.error("VITE_API_BASE is missing.");
            return;
        }

        const sse = new StateleSSEClient(`${API_BASE}/api/webclient/sse`);

        return sse.listen(
            async (connectionId) => {
                const qs = new URLSearchParams();
                qs.set("connectionId", connectionId);
                if (farmId) qs.set("farmId", farmId);
                if (turbineId) qs.set("turbineId", turbineId);
                qs.set("take", String(take));

                const url = `${API_BASE}/api/webclient/GetTelemetry?${qs.toString()}`;
                const res = await fetch(url);
                const initial = (await res.json()) as RealtimeResponse;

                setRows(initial?.data ?? []);
                return initial;
            },
            (payload: any) => {
                const incoming: Telemetry[] | null = Array.isArray(payload)
                    ? (payload as Telemetry[])
                    : Array.isArray((payload as RealtimeResponse)?.data)
                        ? ((payload as RealtimeResponse).data as Telemetry[])
                        : null;

                if (!incoming) return;
                setRows(incoming);
            }
        );
    }, [farmId, turbineId, take]);

    const latestByTurbine = useMemo(() => {
        const map: Record<string, Telemetry> = {};
        for (const t of rows) {
            const id = (t as any).turbineId;
            if (!id) continue;
            map[id] = t;
        }
        return map;
    }, [rows]);

    return { rows, latestByTurbine };
}

export function useTurbineTelemetry(
    farmId: string | undefined,
    turbineId: string | undefined,
    take: number = 200
) {
    const { rows } = useFarmTelemetry(farmId, turbineId, take);
    return rows.slice(-take);
}