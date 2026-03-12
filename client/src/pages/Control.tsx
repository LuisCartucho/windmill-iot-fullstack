import { useContext, useState } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { apiFetch } from "../api/http";
import {
    Play,
    Square,
    TimerReset,
    Wind,
    AlertTriangle,
} from "lucide-react";

export default function Control() {
    const { selected, farmId } = useContext(SelectedTurbine);

    const [busy, setBusy] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [intervalValue, setIntervalValue] = useState(10);
    const [pitchAngle, setPitchAngle] = useState(15);

    async function sendCommand(
        cmd: string,
        extra?: Record<string, unknown>
    ) {
        if (!selected || !farmId || busy) return;

        try {
            setBusy(cmd);
            setError("");
            setMessage("");

            await apiFetch(
                `/api/farms/${encodeURIComponent(farmId)}/turbines/${encodeURIComponent(selected)}/command`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        command: cmd,
                        ...(extra ?? {}),
                    }),
                }
            );

            setMessage(`Command "${cmd}" sent successfully to ${selected}.`);
        } catch (err: any) {
            setError(err?.message ?? `Failed to send "${cmd}" command.`);
        } finally {
            setBusy(null);
        }
    }

    const disabled = !selected || !farmId || busy !== null;

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-6">
                <h2 className="text-3xl font-semibold text-white">Control</h2>
                <p className="mt-2 text-white/55">
                    {selected
                        ? `Remote operator actions for ${selected}`
                        : "Select a turbine to enable commands"}
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="border-b border-white/8 px-6 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                        Turbine Controls
                    </p>
                </div>

                <div className="space-y-6 p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <button
                            onClick={() => sendCommand("start")}
                            disabled={disabled}
                            className="flex h-16 items-center justify-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/85 px-5 text-left text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Play size={18} />
                            <span className="font-medium">
                                {busy === "start" ? "Starting..." : "Start Turbine"}
                            </span>
                        </button>

                        <button
                            onClick={() => sendCommand("stop", { reason: "maintenance" })}
                            disabled={disabled}
                            className="flex h-16 items-center justify-start gap-3 rounded-xl border border-red-400/20 bg-red-600 px-5 text-left text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Square size={18} />
                            <span className="font-medium">
                                {busy === "stop" ? "Stopping..." : "Stop Turbine"}
                            </span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <div className="mb-4 flex items-center gap-3 text-white">
                                <TimerReset size={18} />
                                <h3 className="text-lg font-medium">Set Interval</h3>
                            </div>

                            <label className="mb-2 block text-sm text-white/60">
                                Interval (1–60 seconds)
                            </label>

                            <input
                                type="number"
                                min={1}
                                max={60}
                                value={intervalValue}
                                onChange={(e) => setIntervalValue(Number(e.target.value))}
                                disabled={disabled}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <button
                                onClick={() => sendCommand("setInterval", { value: intervalValue })}
                                disabled={disabled}
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/80 text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <TimerReset size={16} />
                                <span className="font-medium">
                                    {busy === "setInterval" ? "Updating..." : "Apply Interval"}
                                </span>
                            </button>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <div className="mb-4 flex items-center gap-3 text-white">
                                <Wind size={18} />
                                <h3 className="text-lg font-medium">Set Pitch</h3>
                            </div>

                            <label className="mb-2 block text-sm text-white/60">
                                Blade pitch angle (0–30°)
                            </label>

                            <input
                                type="number"
                                min={0}
                                max={30}
                                step={0.1}
                                value={pitchAngle}
                                onChange={(e) => setPitchAngle(Number(e.target.value))}
                                disabled={disabled}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <button
                                onClick={() => sendCommand("setPitch", { angle: pitchAngle })}
                                disabled={disabled}
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/80 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Wind size={16} />
                                <span className="font-medium">
                                    {busy === "setPitch" ? "Updating..." : "Apply Pitch"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-5 py-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-0.5 text-sky-400" />
                    <div>
                        <p className="text-sm font-semibold text-sky-300">
                            Operator Protocol
                        </p>
                        <p className="mt-1 text-sm leading-6 text-sky-200/80">
                            All commands are validated server side and logged with
                            operator identity and timestamp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}