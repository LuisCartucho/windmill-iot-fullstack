import { useContext, useMemo } from "react";
import { SelectedTurbine } from "../layout/Shell";
import type { Telemetry } from "../generated-ts-client";
import MetricChart from "../components/MetricChart";
import StatusCard from "../components/StatusCard";

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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MetricChart
                    title="Wind Speed"
                    data={data}
                    dataKey="windSpeed"
                    unit="m/s"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Power Output"
                    data={data}
                    dataKey="powerOutput"
                    unit="kW"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Rotor Speed"
                    data={data}
                    dataKey="rotorSpeed"
                    unit="rpm"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Ambient Temperature"
                    data={data}
                    dataKey="ambientTemperature"
                    unit="°C"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Wind Direction"
                    data={data}
                    dataKey="windDirection"
                    unit="°"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Nacelle Direction"
                    data={data}
                    dataKey="nacelleDirection"
                    unit="°"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Blade Pitch"
                    data={data}
                    dataKey="bladePitch"
                    unit="°"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Generator Temperature"
                    data={data}
                    dataKey="generatorTemp"
                    unit="°C"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Gearbox Temperature"
                    data={data}
                    dataKey="gearboxTemp"
                    unit="°C"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />

                <MetricChart
                    title="Vibration"
                    data={data}
                    dataKey="vibration"
                    isLoading={telemetryLoading}
                    error={telemetryError}
                />
            </div>

            <div className="max-w-[260px]">
                <StatusCard value={latest?.status ? String(latest.status) : "—"} />
            </div>
        </div>
    );
}