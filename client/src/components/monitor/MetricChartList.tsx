import MetricChart from "./MetricChart";
import type { Telemetry } from "../../generated-ts-client";

type ChartRow = Telemetry & { ts: number };

type MetricConfig = {
    title: string;
    dataKey: keyof Telemetry;
    unit?: string;
};

const METRICS: MetricConfig[] = [
    { title: "Wind Speed", dataKey: "windSpeed", unit: "m/s" },
    { title: "Power Output", dataKey: "powerOutput", unit: "kW" },
    { title: "Rotor Speed", dataKey: "rotorSpeed", unit: "rpm" },
    { title: "Ambient Temperature", dataKey: "ambientTemperature", unit: "°C" },
    { title: "Wind Direction", dataKey: "windDirection", unit: "°" },
    { title: "Nacelle Direction", dataKey: "nacelleDirection", unit: "°" },
    { title: "Blade Pitch", dataKey: "bladePitch", unit: "°" },
    { title: "Generator Temperature", dataKey: "generatorTemp", unit: "°C" },
    { title: "Gearbox Temperature", dataKey: "gearboxTemp", unit: "°C" },
    { title: "Vibration", dataKey: "vibration" },
];

type Props = {
    data: ChartRow[];
    isLoading?: boolean;
    error?: string | null;
};

export default function MetricChartList({
                                            data,
                                            isLoading,
                                            error,
                                        }: Props) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {METRICS.map((metric) => (
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
    );
}