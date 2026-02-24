import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

export default function Topbar() {
    const nav = useNavigate();

    return (
        <header className="h-[72px] w-full px-6 flex items-center bg-base-100/40 backdrop-blur-md border-b border-base-300/20">
            {/* Left spacer */}
            <div className="flex-1" />

            {/* Right cluster */}
            <div className="flex items-center justify-end gap-4">
                {/* Live System pill */}
                <div className="px-4 py-2 rounded-full border border-base-300/30 bg-base-200/20 flex items-center gap-2 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_0_4px_rgba(34,197,94,0.15)]" />
                    <span className="text-sm font-semibold text-base-content/80">Live System</span>
                </div>

                {/* Operator */}
                <div className="text-sm text-base-content/60">
                    Operator: <span className="font-bold text-base-content">admin</span>
                </div>

                {/* Logout icon*/}
                <button
                    className="btn btn-sm btn-ghost rounded-full"
                    title="Logout"
                    onClick={() => nav("/login")}
                >
                    <LogOut size={18} className="opacity-80" />
                </button>
            </div>
        </header>
    );
}
