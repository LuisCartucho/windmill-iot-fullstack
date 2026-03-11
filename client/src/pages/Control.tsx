import { useContext, useState } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { apiFetch } from "../api/http";
import {
    Play,
    Square,
    RotateCcw,
    Wrench,
    AlertTriangle,
} from "lucide-react";

export default function Control() {
    const { selected, farmId } = useContext(SelectedTurbine);
    const [busy, setBusy] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function sendCommand(cmd: string) {
        if (!selected || !farmId) return;

        try {
            setBusy(cmd);
            setError("");
            setMessage("");

            const res = await apiFetch(`/api/farms/${farmId}/turbines/${selected}/command`, {
                method: "POST",
                body: JSON.stringify({ command: cmd }),
            });

            console.log("Command response:", res);
            setMessage(`Command "${cmd}" sent successfully to ${selected}.`);
        } catch (err: any) {
            console.error(err);
            setError(err?.message ?? `Failed to send "${cmd}" command.`);
        } finally {
            setBusy(null);
        }
    }

    const disabled = !selected || !farmId || busy !== null;
    console.log("selected:", selected, "farmId:", farmId, "busy:", busy);

    return (
        <div className="w-full max-w-3xl">
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

                <div className="p-6">
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
                            onClick={() => sendCommand("stop")}
                            disabled={disabled}
                            className="flex h-16 items-center justify-start gap-3 rounded-xl border border-red-400/20 bg-red-600 px-5 text-left text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Square size={18} />
                            <span className="font-medium">
                                {busy === "stop" ? "Stopping..." : "Emergency Stop"}
                            </span>
                        </button>

                        <button
                            disabled
                            className="flex h-16 items-center justify-start gap-3 rounded-xl border border-blue-400/10 bg-blue-600/40 px-5 text-left text-white/60 opacity-60 cursor-not-allowed"
                        >
                            <RotateCcw size={18} />
                            <span className="font-medium">
                                Reset System (unsupported)
                            </span>
                        </button>

                        <button
                            onClick={() => sendCommand("maintenance")}
                            disabled={disabled}
                            className="flex h-16 items-center justify-start gap-3 rounded-xl border border-white/10 bg-white/15 px-5 text-left text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Wrench size={18} />
                            <span className="font-medium">
                                {busy === "maintenance"
                                    ? "Switching..."
                                    : "Maintenance Mode"}
                            </span>
                        </button>
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
                            All commands are logged with your username and timestamp.
                            Unauthorized actions are strictly prohibited and monitored
                            by security systems.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}