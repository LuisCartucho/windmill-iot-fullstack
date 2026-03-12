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

    const lastUpdateText = useMemo(() => {
        if (!latest?.timestamp) return "No live data yet";

        const d = new Date(latest.timestamp);
        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }, [latest]);

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
            <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Live Monitor</h2>
                    <p className="text-sm text-white/50">
                        Real-time telemetry for {selected}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[460px] xl:justify-end">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                        Last update: {lastUpdateText}
                    </div>

                    <div className="sm:min-w-[220px]">
                        <StatusCard value={latest?.status ? String(latest.status) : "—"} />
                    </div>
                </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto pr-2">
                <MetricChartList
                    data={data}
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />
            </div>
        </div>
    );
}