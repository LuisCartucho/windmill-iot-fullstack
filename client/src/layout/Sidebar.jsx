export default function Sidebar({
                                    turbines,
                                    selected,
                                    onSelect,
                                    latestByTurbine,
                                }) {
    return (
        <aside className="h-full p-5 border-r border-base-300/40 bg-base-100">
            {/* Header */}
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
                {turbines.map((t) => {
                    const active = t.id === selected;

                    const latest = latestByTurbine?.[t.id];
                    const kw =
                        latest?.powerOutput != null
                            ? Math.round(latest.powerOutput)
                            : null;

                    const wind =
                        latest?.windSpeed != null
                            ? latest.windSpeed.toFixed(1)
                            : null;

                    return (
                        <button
                            key={t.id}
                            onClick={() => onSelect(t.id)}
                            className={[
                                "w-full text-left rounded-2xl p-4 transition",
                                "border border-base-300/40 bg-base-200/20 hover:bg-base-200/40",
                                active ? "border-success/40 bg-success/10" : "",
                            ].join(" ")}
                        >
                            {/* Top Row */}
                            <div className="flex items-center justify-between">
                                <div className="font-semibold">{t.name}</div>

                                <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_0_4px_rgba(34,197,94,0.15)]" />
                            </div>

                            {/* ID */}
                            <div className="mt-1 text-xs text-base-content/50">
                                ID: {t.id}
                            </div>

                            {/* Wind + Power */}
                            <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                                <div className="text-base-content/50">
                                    {wind != null ? `Wind: ${wind} m/s` : "Wind: —"}
                                </div>

                                <div className="text-base-content/70">
                                    {kw != null ? `${kw} kW` : "— kW"}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}