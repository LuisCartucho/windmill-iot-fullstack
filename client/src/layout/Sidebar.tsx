import type { Telemetry } from "../generated-ts-client";

type TurbineItem = {
    id: string;
    name: string;
};

type Props = {
    turbines: TurbineItem[];
    selected?: string;
    onSelect: (turbineId: string) => void;
    latestByTurbine: Record<string, Telemetry>;
};

export default function Sidebar({
                                    turbines,
                                    selected,
                                    onSelect,
                                    latestByTurbine,
                                }: Props) {
    return (
        <aside className="h-full p-5 border-r border-base-300/40 bg-base-100">
            <div className="flex items-center gap-3 mb-5">
                <div className="btn btn-sm btn-ghost rounded-xl px-3">
                    <span className="text-md">≋</span>
                </div>
                <div className="font-bold text-md">Windmill Inspection Centre</div>
            </div>

            <div className="text-xs tracking-widest text-base-content/50 mb-3">
                OFFSHORE TURBINES
            </div>

            <div className="flex flex-col gap-2">
                {turbines.map((t: TurbineItem) => {
                    const latest = latestByTurbine[t.id];
                    const isSelected = selected === t.id;

                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => onSelect(t.id)}
                            className={`text-left rounded-2xl border p-4 transition ${
                                isSelected
                                    ? "border-emerald-400/60 bg-emerald-500/10"
                                    : "border-base-300/30 bg-base-100/30 hover:bg-base-100/50"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold text-lg">{t.name}</div>
                                    <div className="text-sm text-base-content/50">
                                        ID: {t.id}
                                    </div>
                                </div>
                                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-400" />
                            </div>

                            <div className="mt-4 flex items-end justify-between text-sm">
                                <div className="text-base-content/70">
                                    Wind: {latest?.windSpeed?.toFixed(1) ?? "—"} m/s
                                </div>
                                <div className="font-semibold text-base-content/80">
                                    {latest?.powerOutput?.toFixed(0) ?? "—"} kW
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}