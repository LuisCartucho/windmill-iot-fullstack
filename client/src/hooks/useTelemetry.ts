import { useEffect, useMemo, useState } from "react";
import { StateleSSEClient } from "statele-sse";
import type {
    Telemetry,
    RealtimeListenResponseOfListOfTelemetry,
} from "../generated-ts-client";

type RealtimeResponse = RealtimeListenResponseOfListOfTelemetry;

// IMPORTANT: Set VITE_API_BASE in .env.development and .env.production.
const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

export function useFarmTelemetry(farmId?: string, take: number = 500) {
    const [rows, setRows] = useState<Telemetry[]>([]);

    useEffect(() => {
        if (!API_BASE) {
            console.error(
                "VITE_API_BASE is missing. Set it in .env.production and rebuild/redeploy."
            );
            return;
        }

        // Create the SSE client inside the effect so it uses the correct API base
        // and is recreated if API_BASE ever changes.
        const sse = new StateleSSEClient(`${API_BASE}/api/webclient/sse`);

        console.log("SSE client created. Listening for data...");

        // subscribe without turbineId => get all turbines for that farm
        return sse.listen(
            async (connectionId) => {
                console.log("SSE connection established with ID:", connectionId);  // Debug log for connection

                const qs = new URLSearchParams();
                qs.set("connectionId", connectionId);
                if (farmId) qs.set("farmId", farmId);
                qs.set("take", String(take));

                const url = `${API_BASE}/api/webclient/GetTelemetry?${qs.toString()}`;
                const res = await fetch(url);
                const initial = (await res.json()) as RealtimeResponse;

                console.log("Initial telemetry data received:", initial?.data);  // Log the initial data

                setRows(initial?.data ?? []);
                return initial;
            },
            (payload: any) => {
                console.log("New SSE payload received:", payload);  // Debug log for incoming data
                const incoming: Telemetry[] | null = Array.isArray(payload)
                    ? (payload as Telemetry[])
                    : Array.isArray((payload as RealtimeResponse)?.data)
                        ? ((payload as RealtimeResponse).data as Telemetry[])
                        : null;

                if (!incoming || incoming.length === 0) return;

                // Here we append incoming data but make sure to keep the most recent N entries
                setRows((prev) => {
                    const combined = [...prev, ...incoming];
                    return combined.slice(-take);
                });
            }
        );
    }, [farmId, take]);

    // Latest telemetry per turbineId for sidebar
    const latestByTurbine = useMemo(() => {
        const map: Record<string, Telemetry> = {};
        for (const t of rows) {
            const id = (t as any).turbineId;
            if (!id) continue;
            map[id] = t; // rows are chronological, so later overwrites earlier
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
    const { rows } = useFarmTelemetry(farmId, 500);

    const filtered = useMemo(() => {
        if (!turbineId) return [];
        const list = rows.filter((r: any) => r.turbineId === turbineId);
        return list.slice(-take);
    }, [rows, turbineId, take]);

    return filtered;
}