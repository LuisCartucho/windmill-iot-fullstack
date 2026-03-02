import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabs from "./Tabs";

const API = import.meta.env.VITE_API_BASE;

const TURBINES = [
    { id: "turbine-alpha", name: "Alpha" },
    { id: "turbine-beta", name: "Beta" },
    { id: "turbine-gamma", name: "Gamma" },
    { id: "turbine-delta", name: "Delta" },
];

export const SelectedTurbine = React.createContext({
    selected: null,
    setSelected: () => {},
});

export default function Shell() {
    const [selected, setSelected] = useState(null);
    const [latestByTurbine, setLatestByTurbine] = useState({});

    useEffect(() => {
        let alive = true;

        async function loadLatest() {
            try {
                const results = await Promise.all(
                    TURBINES.map(async (t) => {
                        const res = await fetch(
                            `${API}/api/webclient/telemetry?turbineId=${encodeURIComponent(t.id)}&take=1`
                        );
                        if (!res.ok) return [t.id, null];
                        const arr = await res.json();
                        return [t.id, arr?.[0] ?? null];
                    })
                );

                if (!alive) return;

                const next = {};
                for (const [id, row] of results) next[id] = row;
                setLatestByTurbine(next);
            } catch {
                // ignore
            }
        }

        loadLatest();
        const interval = setInterval(loadLatest, 5000);

        return () => {
            alive = false;
            clearInterval(interval);
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