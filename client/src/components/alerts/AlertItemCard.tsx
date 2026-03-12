import { AlertTriangle } from "lucide-react";
import type { Alert } from "../../generated-ts-client";

type Props = {
    alert: Alert;
};

function getSeverityStyle(severity?: string | null) {
    const value = (severity ?? "").trim().toLowerCase();

    if (value === "warning") {
        return {
            container:
                "border-red-500/35 bg-red-950/45 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.05)]",
            icon: "text-red-500",
            label: "text-red-500",
        };
    }

    return {
        container:
            "border-white/10 bg-white/[0.03] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
        icon: "text-white/70",
        label: "text-white/70",
    };
}

function formatAlertTime(value?: string | null) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
}

export default function AlertItemCard({ alert }: Props) {
    const styles = getSeverityStyle(alert.severity);
    const severityText = (alert.severity ?? "info").toUpperCase();

    return (
        <div
            className={`rounded-2xl border px-4 py-3 transition ${styles.container}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <AlertTriangle className={`h-5 w-5 ${styles.icon}`} strokeWidth={2.1} />
                    </div>

                    <div>
                        <div className={`text-base font-bold tracking-wide ${styles.label}`}>
                            {severityText}
                        </div>
                        <div className="mt-1 text-base md:text-lg leading-snug text-white/90">
                            {alert.message ?? "No message"}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 pt-0.5 text-[11px] md:text-xs text-white/35">
                    {formatAlertTime(alert.timestamp)}
                </div>
            </div>
        </div>
    );
}