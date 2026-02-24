import React, { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabs from "./Tabs";

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

    return (
        <div className="min-h-screen grid grid-cols-[320px_1fr]" data-theme="dark">
            <Sidebar turbines={TURBINES} selected={selected} onSelect={setSelected} />

            {/* right side panel */}
            <div className="flex flex-col min-h-screen">
                <div className="h-[72px] shrink-0">
                    <Topbar />
                </div>

                <div className="h-[56px] shrink-0">
                    <Tabs />
                </div>

                {/* this part for proper scrolling/centering */}
                <div className="flex-1 min-h-0 p-5 overflow-auto">
                    <SelectedTurbine.Provider value={{ selected, setSelected }}>
                        <Outlet />
                    </SelectedTurbine.Provider>
                </div>
            </div>
        </div>
    );
}
