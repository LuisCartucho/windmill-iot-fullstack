import { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabs from "./Tabs";
import type { Telemetry } from "../generated-ts-client";

const API_BASE = "http://localhost:5117";

type TurbineInfo = {
    id: string;
    name: string;
};

type SelectedTurbineContextValue = {
    selected: string | null;
    setSelected: (id: string | null) => void;
};

export const SelectedTurbine = createContext<SelectedTurbineContextValue>({
    selected: null,
    setSelected: () => {},
});

const TURBINES: TurbineInfo[] = [
    { id: "turbine-alpha", name: "Alpha" },
    { id: "turbine-beta", name: "Beta" },
    { id: "turbine-gamma", name: "Gamma" },
    { id: "turbine-delta", name: "Delta" },
];

type LatestByTurbine = Record<string, Telemetry | null>;

export default function Shell() {
    const [selected, setSelected] = useState<string | null>(null);
    const [latestByTurbine, setLatestByTurbine] = useState<LatestByTurbine>({});

    useEffect(() => {
        let alive = true;

        const loadLatest = async () => {
            try {
                const results = await Promise.all(
                    TURBINES.map(async (t): Promise<[string, Telemetry | null]> => {
                        const url = `${API_BASE}/api/webclient/telemetry?turbineId=${encodeURIComponent(
                            t.id
                        )}&take=1`;

                        const res = await fetch(url);
                        if (!res.ok) return [t.id, null];

                        const arr = (await res.json()) as Telemetry[];
                        return [t.id, Array.isArray(arr) ? (arr[0] ?? null) : null];
                    })
                );

                if (!alive) return;

                const next: LatestByTurbine = {};
                for (const [id, row] of results) next[id] = row;
                setLatestByTurbine(next);
            } catch {
                // ignore
            }
        };

        loadLatest();
        const interval = window.setInterval(loadLatest, 5000);

        return () => {
            alive = false;
            window.clearInterval(interval);
        };
    }, []);

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
                    <SelectedTurbine.Provider value={{ selected, setSelected }}>
                        <Outlet />
                    </SelectedTurbine.Provider>
                </div>
            </div>
        </div>
    );
}