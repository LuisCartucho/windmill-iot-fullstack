import { useContext, useMemo } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { useTurbineTelemetry } from "../hooks/useTelemetry";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function Monitor() {
    const { selected, farmId } = useContext(SelectedTurbine);
    const telemetry = useTurbineTelemetry(farmId ?? undefined, selected ?? undefined, 500);

    // Convert timestamp → numeric time, sort, dedupe, and keep a rolling window
    const data = useMemo(() => {
        const mapped = telemetry
            .map((t: any) => ({ ...t, ts: Date.parse(t.timestamp) }))
            .filter((t: any) => Number.isFinite(t.ts))
            .sort((a: any, b: any) => a.ts - b.ts);

        // Dedupe by timestamp (keep the last sample for each ts)
        const byTs = new Map<number, any>();
        for (const row of mapped) byTs.set(row.ts, row);
        const deduped = Array.from(byTs.values()).sort((a, b) => a.ts - b.ts);

        // Rolling window: last 5 minutes (change if you want)
        const WINDOW_MS = 5 * 60 * 1000;
        const cutoff = Date.now() - WINDOW_MS;
        return deduped.filter((d) => d.ts >= cutoff);
    }, [telemetry]);

    if (!selected) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-72px-56px)] flex items-center justify-center">
                <div className="text-sm text-base-content/60">
                    Select a turbine to begin monitoring
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <Chart title="Wind Speed (m/s)">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />

                        <YAxis domain={["auto", "auto"]} />

                        <Tooltip
                            labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
                        />

                        <Line
                            type="linear"
                            dataKey="windSpeed"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Chart>

            <Chart title="Power Output (kW)">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                        />

                        <YAxis domain={["auto", "auto"]} />

                        <Tooltip
                            labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
                        />

                        <Line
                            type="linear"
                            dataKey="powerOutput"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Chart>
        </div>
    );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-base-300/30 bg-base-100/20 p-4">
            <div className="mb-2 font-semibold opacity-80">{title}</div>
            {children}
        </div>
    );
}