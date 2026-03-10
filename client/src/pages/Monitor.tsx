import React, { useContext, useMemo } from "react";
import { SelectedTurbine } from "../layout/Shell";
import type { Telemetry } from "../generated-ts-client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type ChartRow = Telemetry & { ts: number };

const WINDOW_MS = 5 * 60 * 1000;

export default function Monitor() {
    const {
        selected,
        telemetryRows,
        telemetryLoading,
        telemetryError,
    } = useContext(SelectedTurbine);

    const data: ChartRow[] = useMemo(() => {
        if (!telemetryRows?.length) return [];

        const mapped: ChartRow[] = telemetryRows
            .map((t) => {
                const ts = t.timestamp ? Date.parse(t.timestamp) : NaN;
                return { ...t, ts };
            })
            .filter((t) => Number.isFinite(t.ts))
            .sort((a, b) => a.ts - b.ts);

/*        const cutoff = Date.now() - WINDOW_MS;
        return mapped.filter((d) => d.ts >= cutoff);*/
        return mapped;
    }, [telemetryRows]);

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
            <Chart title="Wind Speed (m/s)" isLoading={telemetryLoading} error={telemetryError}>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()} />
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

            <Chart title="Power Output (kW)" isLoading={telemetryLoading} error={telemetryError}>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(v) => new Date(Number(v)).toLocaleTimeString()}
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip labelFormatter={(v) => new Date(Number(v)).toLocaleTimeString()} />
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

function Chart({
                   title,
                   children,
                   isLoading,
                   error,
               }: {
    title: string;
    children: React.ReactNode;
    isLoading?: boolean;
    error?: string | null;
}) {
    return (
        <div className="rounded-2xl border border-base-300/30 bg-base-100/20 p-4">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold opacity-80">{title}</div>
                {isLoading && <div className="text-xs text-base-content/50">Loading...</div>}
            </div>
            {error ? <div className="mb-2 text-sm text-error">{error}</div> : null}
            {children}
        </div>
    );
}