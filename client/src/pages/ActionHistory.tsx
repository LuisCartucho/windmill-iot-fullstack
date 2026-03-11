import { useContext, useEffect, useState } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { apiFetch } from "../api/http";

type CommandItem = {
    id: string;
    farmId: string;
    turbineId: string;
    userId: string;
    userNickname: string; // Correct property for User's nickname
    timestamp: string;
    action: string;
    payload: string;
};

function formatTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function getStatus(action: string) {
    switch ((action || "").toLowerCase()) {
        case "start":
            return "Executed";
        case "stop":
            return "Emergency stop";
        case "maintenance":
            return "Maintenance";
        default:
            return "Executed";
    }
}

export default function ActionHistory() {
    const ctx = useContext(SelectedTurbine);
    const selected = ctx?.selected;
    const farmId = ctx?.farmId;

    const [items, setItems] = useState<CommandItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!selected || !farmId) {
            setItems([]);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setErr("");

                const data = await apiFetch(
                    `/api/commands?farmId=${encodeURIComponent(farmId!)}&turbineId=${encodeURIComponent(selected!)}`
                );

                if (!cancelled) {
                    setItems(Array.isArray(data) ? data : []);
                }
            } catch (e: any) {
                console.error("Failed to load action history", e);
                if (!cancelled) {
                    setErr("Failed to load action history.");
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [selected, farmId]);

    return (
        <div className="h-full w-full px-6 py-5 text-white">
            <div className="mb-5">
                <h2 className="text-3xl font-semibold">Action History</h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
                <div className="grid grid-cols-4 gap-4 border-b border-white/5 bg-white/[0.04] px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/35">
                    <div>Timestamp</div>
                    <div>Operator</div>
                    <div>Action</div>
                    <div>Status</div>
                </div>

                {loading && (
                    <div className="px-6 py-6 text-sm text-white/50">
                        Loading...
                    </div>
                )}

                {!loading && err && (
                    <div className="px-6 py-6 text-sm text-red-300">
                        {err}
                    </div>
                )}

                {!loading && !err && items.length === 0 && (
                    <div className="px-6 py-6 text-sm text-white/40">
                        No actions recorded yet.
                    </div>
                )}

                {!loading &&
                    !err &&
                    items.map((item) => (
                        <div
                            key={item.id} // Use the `id` for the key instead of `userNickname`
                            className="grid grid-cols-4 gap-4 border-b border-white/5 px-6 py-4 text-sm last:border-b-0"
                        >
                            <div className="text-white/80">
                                {formatTime(item.timestamp)}
                            </div>

                            <div className="text-white/60">
                                {item.userNickname || "admin"} {/* Use UserNickname */}
                            </div>

                            <div>
                                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                                    {item.action}
                                </span>
                            </div>

                            <div className="text-white/60">
                                {getStatus(item.action)}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}