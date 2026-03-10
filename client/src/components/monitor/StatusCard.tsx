type Props = {
    value?: string | null;
};

export default function StatusCard({ value }: Props) {
    const normalized = (value ?? "").trim().toLowerCase();

    const badgeClass =
        normalized === "running"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/20"
            : normalized === "stopped"
                ? "bg-red-500/15 text-red-400 border-red-400/20"
                : "bg-white/10 text-white/70 border-white/10";

    return (
        <div className="rounded-2xl border border-white/6 bg-white/[0.03] backdrop-blur-sm px-5 py-4">
            <div className="text-sm text-white/55">Status</div>
            <div className="mt-3">
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${badgeClass}`}
        >
          {value || "—"}
        </span>
            </div>
        </div>
    );
}