import { useContext, useMemo } from "react";
import { SelectedTurbine } from "../layout/Shell";
import type { Telemetry } from "../generated-ts-client";
import MetricChartList from "../components/monitor/MetricChartList";
import StatusCard from "../components/monitor/StatusCard";

type ChartRow = Telemetry & { ts: number };

export default function Monitor() {
    const {
        selected,
        telemetryRows,
        telemetryLoading,
        telemetryError,
    } = useContext(SelectedTurbine);

    const data: ChartRow[] = useMemo(() => {
        if (!telemetryRows?.length) return [];

        return telemetryRows
            .map((t) => {
                const ts = t.timestamp ? Date.parse(t.timestamp) : NaN;
                return { ...t, ts };
            })
            .filter((t) => Number.isFinite(t.ts))
            .sort((a, b) => a.ts - b.ts);
    }, [telemetryRows]);

    const latest = useMemo(() => {
        if (!data.length) return null;
        return data[data.length - 1];
    }, [data]);

    if (!selected) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-72px-56px)] flex items-center justify-center">
                <div className="text-sm text-white/50">
                    Select a turbine to begin monitoring
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="max-h-[70vh] overflow-y-auto pr-2">
                <MetricChartList
                    data={data}
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <div className="mt-4 max-w-65">
                    <StatusCard value={latest?.status ? String(latest.status) : "—"} />
                </div>
            </div>
        </div>
    );
}