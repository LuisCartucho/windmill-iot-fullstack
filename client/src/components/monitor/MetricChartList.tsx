import MetricChart from "./MetricChart";
import type { Telemetry } from "../../generated-ts-client";

type ChartRow = Telemetry & { ts: number };

type MetricConfig = {
    title: string;
    dataKey: keyof Telemetry;
    unit?: string;
};

const PRIMARY_METRICS: MetricConfig[] = [
    { title: "Power Output", dataKey: "powerOutput", unit: "kW" },
    { title: "Rotor Speed", dataKey: "rotorSpeed", unit: "rpm" },
    { title: "Wind Speed", dataKey: "windSpeed", unit: "m/s" },
    { title: "Generator Temperature", dataKey: "generatorTemp", unit: "°C" },
];

const SECONDARY_METRICS: MetricConfig[] = [
    { title: "Gearbox Temperature", dataKey: "gearboxTemp", unit: "°C" },
    { title: "Ambient Temperature", dataKey: "ambientTemperature", unit: "°C" },
    { title: "Blade Pitch", dataKey: "bladePitch", unit: "°" },
    { title: "Vibration", dataKey: "vibration" },
    { title: "Wind Direction", dataKey: "windDirection", unit: "°" },
    { title: "Nacelle Direction", dataKey: "nacelleDirection", unit: "°" },
];

type Props = {
    data: ChartRow[];
    isLoading?: boolean;
    error?: string | null;
};

function ChartSection({
                          title,
                          metrics,
                          data,
                          isLoading,
                          error,
                      }: {
    title: string;
    metrics: MetricConfig[];
    data: ChartRow[];
    isLoading?: boolean;
    error?: string | null;
}) {
    return (
        <section className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                {title}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                    <MetricChart
                        key={String(metric.dataKey)}
                        title={metric.title}
                        data={data}
                        dataKey={String(metric.dataKey)}
                        unit={metric.unit}
                        isLoading={isLoading}
                        error={error}
                    />
                ))}
            </div>
        </section>
    );
}

export default function MetricChartList({
                                            data,
                                            isLoading,
                                            error,
                                        }: Props) {
    return (
        <div className="space-y-6">
            <ChartSection
                title="Primary Metrics"
                metrics={PRIMARY_METRICS}
                data={data}
                isLoading={isLoading}
                error={error}
            />

            <ChartSection
                title="Secondary Metrics"
                metrics={SECONDARY_METRICS}
                data={data}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}