import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";
import AlertsList from "../components/alerts/AlertsList";

export default function Alerts() {
    const {
        selected,
        alerts,
        alertsLoading,
        alertsError,
    } = useContext(SelectedTurbine);

    if (!selected) {
        return (
            <div className="p-4 text-sm text-white/50">
                Select a turbine to view alerts
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Alerts</h2>
                {alertsLoading ? (
                    <div className="text-xs text-white/40">Loading...</div>
                ) : null}
            </div>

            {alertsError ? (
                <p className="mt-3 text-sm text-error">{alertsError}</p>
            ) : alerts.length === 0 ? (
                <p className="mt-3 text-white/50">No alerts</p>
            ) : (
                <AlertsList alerts={alerts} />
            )}
        </div>
    );
}