import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type Props<T> = {
    title: string;
    data: T[];
    dataKey: string;
    isLoading?: boolean;
    error?: string | null;
    unit?: string;
};

export default function MetricChart<T extends { ts: number } & Record<string, any>>({
                                                                                        title,
                                                                                        data,
                                                                                        dataKey,
                                                                                        isLoading,
                                                                                        error,
                                                                                        unit,
                                                                                    }: Props<T>) {
    const latestValue = useMemo(() => {
        if (!data.length) return null;

        const latest = data[data.length - 1]?.[dataKey];

        if (latest === null || latest === undefined || Number.isNaN(latest)) {
            return null;
        }

        if (typeof latest === "number") {
            return latest.toFixed(2);
        }

        return String(latest);
    }, [data, dataKey]);

    return (
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] backdrop-blur-sm p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                        {title}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-white">
                        {latestValue !== null
                            ? unit
                                ? `${latestValue} ${unit}`
                                : latestValue
                            : "—"}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isLoading && !error && data.length > 0 ? (
                        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                            Live
                        </div>
                    ) : null}

                    {isLoading ? (
                        <div className="text-xs text-white/35">Loading...</div>
                    ) : null}
                </div>
            </div>

            {error ? <div className="mb-2 text-sm text-red-400">{error}</div> : null}

            {!isLoading && !error && data.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-sm text-white/40">
                    No telemetry data
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                        data={data}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                            tickFormatter={(v) =>
                                new Date(Number(v)).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })
                            }
                            minTickGap={28}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                            tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        />
                        <YAxis
                            domain={["auto", "auto"]}
                            width={48}
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                            tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "rgba(15, 23, 42, 0.9)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "14px",
                                color: "#fff",
                            }}
                            labelFormatter={(v) =>
                                new Date(Number(v)).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })
                            }
                            formatter={(value: number | string | undefined) => {
                                const displayValue =
                                    value === null || value === undefined
                                        ? "—"
                                        : unit
                                            ? `${value} ${unit}`
                                            : value;

                                return [displayValue, title];
                            }}
                        />
                        <Line
                            type="linear"
                            dataKey={dataKey}
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}