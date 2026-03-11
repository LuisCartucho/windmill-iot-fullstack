import type { CommandItem } from "../../hooks/useCommandHistory";
import CommandHistoryRow from "./CommandHistoryRow";

type Props = {
    items: CommandItem[];
    loading: boolean;
    err: string;
};

export default function CommandHistoryList({ items, loading, err }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
            <div className="grid grid-cols-4 gap-4 border-b border-white/5 bg-white/[0.04] px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-white/35">
                <div>Timestamp</div>
                <div>Operator</div>
                <div>Command</div>
                <div>Status</div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
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
                        No commands recorded yet.
                    </div>
                )}

                {!loading &&
                    !err &&
                    items.map((item) => (
                        <CommandHistoryRow key={item.id} item={item} />
                    ))}
            </div>
        </div>
    );
}