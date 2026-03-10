import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";

export default function Alerts() {
    const {
        selected,
        alerts,
        alertsLoading,
        alertsError,
    } = useContext(SelectedTurbine);

    if (!selected) {
        return (
            <div className="p-4 text-sm text-base-content/60">
                Select a turbine to view alerts
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Alerts</h2>
                {alertsLoading && (
                    <div className="text-xs text-base-content/50">Loading...</div>
                )}
            </div>

            {alertsError ? (
                <p className="mt-2 text-sm text-error">{alertsError}</p>
            ) : alerts.length === 0 ? (
                <p className="mt-2 text-base-content/60">No alerts</p>
            ) : (
                <div className="mt-4 space-y-2">
                    {alerts.map((a) => (
                        <div
                            key={`${a.turbineId ?? ""}-${a.timestamp ?? ""}-${a.message ?? ""}`}
                            className="rounded-xl border border-base-300/30 bg-base-100/30 p-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-semibold">{a.severity}</div>
                                <div className="text-xs opacity-60">
                                    {a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}
                                </div>
                            </div>
                            <div className="mt-1 text-sm opacity-90">{a.message}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}