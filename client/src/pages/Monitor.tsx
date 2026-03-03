import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { useRealtimeTelemetry } from "../hooks/useTelemetry";
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
    const { selected } = useContext(SelectedTurbine);

    const telemetry = useRealtimeTelemetry(undefined, selected ?? undefined, 200);

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
                    <LineChart data={telemetry}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => (v ? new Date(v).toLocaleTimeString() : "")}
                        />
                        <YAxis domain={[0, 25]} />
                        <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
                        <Line type="monotone" dataKey="windSpeed" dot={false} strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Chart>

            <Chart title="Power Output (kW)">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={telemetry}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => (v ? new Date(v).toLocaleTimeString() : "")}
                        />
                        <YAxis domain={[0, 3000]} />
                        <Tooltip labelFormatter={(v) => new Date(v).toLocaleTimeString()} />
                        <Line type="monotone" dataKey="powerOutput" dot={false} strokeWidth={2} isAnimationActive={false} />
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