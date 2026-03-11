import { Activity, AlertTriangle, Wrench } from "lucide-react";

type Props = {
    value?: string | null;
};

export default function StatusCard({ value }: Props) {
    const normalized = (value ?? "").trim().toLowerCase();

    let badgeClass =
        "bg-white/10 text-white/70 border-white/10";
    let icon = null;
    let label = value ?? "—";

    if (normalized === "running") {
        badgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-400/20";
        icon = <Activity size={16} />;
        label = "Running";
    }

    if (normalized === "stopped") {
        badgeClass = "bg-red-500/15 text-red-400 border-red-400/20";
        icon = <AlertTriangle size={16} />;
        label = "Stopped";
    }

    if (normalized === "maintenance") {
        badgeClass = "bg-yellow-500/15 text-yellow-400 border-yellow-400/20";
        icon = <Wrench size={16} />;
        label = "Maintenance";
    }

    return (
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] backdrop-blur-sm px-5 py-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-white/55">Turbine Status</div>

                <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-300">
                    Live
                </div>
            </div>

            <div className="mt-4">
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${badgeClass}`}
                >
                    {icon}
                    {label}
                </span>
            </div>
        </div>
    );
}