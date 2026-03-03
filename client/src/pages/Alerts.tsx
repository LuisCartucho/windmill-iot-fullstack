import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";
import { useRealtimeAlerts } from "../hooks/useAlerts";

export default function Alerts() {
    const { selected } = useContext(SelectedTurbine);
    const alerts = useRealtimeAlerts(undefined, selected ?? undefined, 200);

    if (!selected) {
        return (
            <div className="p-4 text-sm text-base-content/60">
                Select a turbine to view alerts
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Alerts</h2>

            {alerts.length === 0 ? (
                <p className="text-base-content/60 mt-2">No alerts</p>
            ) : (
                <div className="mt-4 space-y-2">
                    {alerts.map((a) => (
                        <div key={a.id} className="rounded-xl border border-base-300/30 bg-base-100/30 p-3">
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