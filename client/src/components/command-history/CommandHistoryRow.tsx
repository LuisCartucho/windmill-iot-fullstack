import type { CommandItem } from "../../hooks/useCommandHistory";

type Props = {
    item: CommandItem;
};

function formatTime(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
}

function parsePayload(payload: string) {
    try {
        return JSON.parse(payload);
    } catch {
        return null;
    }
}

function getStatus(item: CommandItem) {
    const action = (item.action || "").toLowerCase();
    const payload = parsePayload(item.payload);

    switch (action) {
        case "start":
            return "Started";
        case "stop":
            return payload?.reason
                ? `Stopped (${payload.reason})`
                : "Stopped";
        case "setinterval":
            return payload?.value != null
                ? `Set to ${payload.value}s`
                : "Interval updated";
        case "setpitch":
            return payload?.angle != null
                ? `Set to ${payload.angle}°`
                : "Pitch updated";
        default:
            return "Executed";
    }
}

function getActionLabel(action: string) {
    switch ((action || "").toLowerCase()) {
        case "setinterval":
            return "Set Interval";
        case "setpitch":
            return "Set Pitch";
        case "start":
            return "Start";
        case "stop":
            return "Stop";
        default:
            return action;
    }
}

function getActionClass(action: string) {
    switch ((action || "").toLowerCase()) {
        case "start":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
        case "stop":
            return "border-red-400/20 bg-red-500/10 text-red-300";
        case "setinterval":
            return "border-sky-400/20 bg-sky-500/10 text-sky-300";
        case "setpitch":
            return "border-violet-400/20 bg-violet-500/10 text-violet-300";
        default:
            return "border-white/10 bg-white/10 text-white/70";
    }
}

export default function CommandHistoryRow({ item }: Props) {
    return (
        <div className="grid grid-cols-4 gap-4 border-b border-white/5 px-6 py-4 text-sm last:border-b-0">
            <div className="text-white/80">
                {formatTime(item.timestamp)}
            </div>

            <div className="text-white/60">
                {item.userNickname || item.userId || "operator"}
            </div>

            <div>
                <span
                    className={[
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        getActionClass(item.action),
                    ].join(" ")}
                >
                    {getActionLabel(item.action)}
                </span>
            </div>

            <div className="text-white/60">
                {getStatus(item)}
            </div>
        </div>
    );
}