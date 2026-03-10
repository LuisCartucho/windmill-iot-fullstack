import React from "react";
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

export default function MetricChart<T extends { ts: number }>({
                                                                  title,
                                                                  data,
                                                                  dataKey,
                                                                  isLoading,
                                                                  error,
                                                                  unit,
                                                              }: Props<T>) {
    return (
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] backdrop-blur-sm p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                    {title}
                </div>
                {isLoading ? (
                    <div className="text-xs text-white/35">Loading...</div>
                ) : null}
            </div>

            {error ? <div className="mb-2 text-sm text-error">{error}</div> : null}

            {!isLoading && !error && data.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-sm text-white/40">
                    No telemetry data
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
                            tickFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                            tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        />
                        <YAxis
                            domain={["auto", "auto"]}
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
                            labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
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
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}