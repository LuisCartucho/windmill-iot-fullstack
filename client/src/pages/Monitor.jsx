import { useContext, useEffect, useMemo, useState } from "react";
import { SelectedTurbine } from "../layout/Shell";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const API = import.meta.env.VITE_API_BASE;
const REFRESH_MS = 5000;
const MAX_POINTS = 200;

export default function Monitor() {
    const { selected } = useContext(SelectedTurbine);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (!selected) return;

        let alive = true;
        let intervalId;

        async function load() {
            try {
                const res = await fetch(
                    `${API}/api/webclient/telemetry?turbineId=${encodeURIComponent(
                        selected
                    )}&take=${MAX_POINTS}`
                );

                if (!res.ok) return;

                const json = await res.json();
                if (!alive || !Array.isArray(json)) return;

                setRows((prev) => {
                    if (prev.length === 0) return json;

                    const prevLast = prev.at(-1)?.timestamp;
                    const nextLast = json.at(-1)?.timestamp;

                    if (prevLast === nextLast) return prev;

                    const prevLastTime = prevLast
                        ? new Date(prevLast).getTime()
                        : 0;

                    const incoming = json.filter((x) => {
                        const ts = x?.timestamp
                            ? new Date(x.timestamp).getTime()
                            : 0;
                        return ts > prevLastTime;
                    });

                    if (incoming.length === 0) return prev;

                    const merged = [...prev, ...incoming];
                    return merged.slice(-MAX_POINTS);
                });
            } catch {
                // silent fail
            }
        }

        setRows([]);
        load();
        intervalId = setInterval(load, REFRESH_MS);

        return () => {
            alive = false;
            clearInterval(intervalId);
        };
    }, [selected]);

    if (!selected) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-72px-56px)] flex items-center justify-center">
                <div className="text-sm text-base-content/60">
                    Select a turbine to begin monitoring
                </div>
            </div>
        );
    }

    const chartData = rows;

    return (
        <div className="grid grid-cols-2 gap-4">
            <Chart title="Wind Speed (m/s)">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) =>
                                v ? new Date(v).toLocaleTimeString() : ""
                            }
                        />
                        <YAxis domain={[0, 25]} />
                        <Tooltip
                            labelFormatter={(v) =>
                                new Date(v).toLocaleTimeString()
                            }
                        />
                        <Line
                            type="monotone"
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
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) =>
                                v ? new Date(v).toLocaleTimeString() : ""
                            }
                        />
                        <YAxis domain={[0, 3000]} />
                        <Tooltip
                            labelFormatter={(v) =>
                                new Date(v).toLocaleTimeString()
                            }
                        />
                        <Line
                            type="monotone"
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

function Chart({ title, children }) {
    return (
        <div className="rounded-2xl border border-base-300/30 bg-base-100/20 p-4">
            <div className="mb-2 font-semibold opacity-80">{title}</div>
            {children}
        </div>
    );
}