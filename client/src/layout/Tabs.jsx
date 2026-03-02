import { NavLink } from "react-router";
import { Activity, Settings2, AlertTriangle, History } from "lucide-react";

function TabLink({ to, Icon, label, end = false }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    "h-full px-4 flex items-center gap-2",
                    "text-sm font-semibold",
                    "border-b-2 transition-colors",
                    isActive
                        ? "text-success border-success"
                        : "text-base-content/50 border-transparent hover:text-base-content/70",
                ].join(" ")
            }
        >
            <Icon size={16} className="opacity-90" />
            <span>{label}</span>
        </NavLink>
    );
}

export default function Tabs() {
    return (
        <div className="h-[56px] px-5 flex items-end gap-1 bg-base-100/30 border-b border-base-300/20">
            <TabLink to="/app/monitor" Icon={Activity} label="Monitor" />
            <TabLink to="/app/control" Icon={Settings2} label="Control" />
            <TabLink to="/app/alerts" Icon={AlertTriangle} label="Alerts" />
            <TabLink to="/app/history" Icon={History} label="Action History" />
            <div className="flex-1" />
        </div>
    );
}