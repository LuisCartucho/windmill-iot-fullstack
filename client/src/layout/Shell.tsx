import { createContext, useMemo, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabs from "./Tabs";
import { useFarmTelemetry } from "../hooks/useTelemetry";

type SelectedTurbineContextValue = {
    selected: string | null;
    setSelected: (id: string | null) => void;
    farmId: string | null;
};

export const SelectedTurbine = createContext<SelectedTurbineContextValue>({
    selected: null,
    setSelected: () => {},
    farmId: null,
});

const TURBINES = [
    { id: "turbine-alpha", name: "Alpha" },
    { id: "turbine-beta", name: "Beta" },
    { id: "turbine-gamma", name: "Gamma" },
    { id: "turbine-delta", name: "Delta" },
];

export default function Shell() {
    const [selected, setSelected] = useState<string | null>(null);

    // ONE realtime subscription (all farms)
    const { latestByTurbine } = useFarmTelemetry(undefined, undefined, 500);

    // derive farmId from selected turbine's latest telemetry
    const farmId = useMemo(() => {
        if (!selected) return null;
        const latest = latestByTurbine?.[selected] as any;
        return latest?.farmId ?? null;
    }, [latestByTurbine, selected]);

    return (
        <div className="min-h-screen grid grid-cols-[320px_1fr]" data-theme="dark">
            <Sidebar
                turbines={TURBINES}
                selected={selected}
                onSelect={setSelected}
                latestByTurbine={latestByTurbine}
            />

            <div className="flex flex-col min-h-screen">
                <div className="h-[72px] shrink-0">
                    <Topbar />
                </div>

                <div className="h-[56px] shrink-0">
                    <Tabs />
                </div>

                <div className="flex-1 min-h-0 p-5 overflow-auto">
                    <SelectedTurbine.Provider value={{ selected, setSelected, farmId }}>
                        <Outlet />
                    </SelectedTurbine.Provider>
                </div>
            </div>
        </div>
    );
}