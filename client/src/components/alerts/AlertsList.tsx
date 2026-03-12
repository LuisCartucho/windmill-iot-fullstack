import type { Alert } from "../../generated-ts-client";
import AlertItemCard from "./AlertItemCard";

type Props = {
    alerts: Alert[];
};

export default function AlertsList({ alerts }: Props) {
    return (
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-3">
            {alerts.map((alert) => (
                <AlertItemCard
                    key={`${alert.turbineId ?? ""}-${alert.timestamp ?? ""}-${alert.message ?? ""}-${alert.severity ?? ""}`}
                    alert={alert}
                />
            ))}
        </div>
    );
}