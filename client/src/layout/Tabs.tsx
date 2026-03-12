import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import { Activity, SlidersHorizontal, AlertTriangle, History } from "lucide-react";
import { isOperator } from "../api/http";

type TabLinkProps = {
    to: string;
    Icon: ComponentType<{ size?: number; className?: string }>;
    label: string;
    end?: boolean;
};

function TabLink({ to, Icon, label, end = false }: TabLinkProps) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                [
                    "h-14 px-4 flex items-center gap-2",
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
    const canAccessControl = isOperator();

    return (
        <div className="flex items-center gap-4 border-b border-base-300/30">
            <TabLink to="/app/monitor" Icon={Activity} label="Monitor" />
            <TabLink to="/app/alerts" Icon={AlertTriangle} label="Alerts" />
            {canAccessControl && (
                <TabLink to="/app/control" Icon={SlidersHorizontal} label="Control" />
            )}
            <TabLink to="/app/history" Icon={History} label="Command History" />
        </div>
    );
}