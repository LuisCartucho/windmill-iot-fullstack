import {
    createContext,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Tabs from "./Tabs";
import { useTelemetry } from "../hooks/useTelemetry";
import { useAlerts } from "../hooks/useAlerts";
import type { Alert, Telemetry } from "../generated-ts-client";

type SelectedTurbineContextValue = {
    selected: string | null;
    setSelected: Dispatch<SetStateAction<string | null>>;
    farmId: string | null;

    telemetryRows: Telemetry[];
    telemetryLoading: boolean;
    telemetryError: string | null;

    alerts: Alert[];
    alertsLoading: boolean;
    alertsError: string | null;
};

export const SelectedTurbine = createContext<SelectedTurbineContextValue>({
    selected: null,
    setSelected: () => {},
    farmId: null,
    telemetryRows: [],
    telemetryLoading: false,
    telemetryError: null,
    alerts: [],
    alertsLoading: false,
    alertsError: null,
});

const FARM = {
    id: "Wind-Iot-JIANLUI",
    name: "Wind-Iot-JIANLUI",
};

const TURBINES = [
    { id: "turbine-alpha", name: "Alpha", location: "North Platform" },
    { id: "turbine-beta", name: "Beta", location: "North Platform" },
    { id: "turbine-gamma", name: "Gamma", location: "South Platform" },
    { id: "turbine-delta", name: "Delta", location: "East Platform" },
];

export default function Shell() {
    const [selected, setSelected] = useState<string | null>("turbine-alpha");

    return (
        <div className="min-h-screen grid grid-cols-[320px_1fr]" data-theme="dark">
            <Sidebar
                turbines={TURBINES}
                selected={selected ?? undefined}
                onSelect={(id) => {
                    setSelected(id);
                }}
                latestByTurbine={{}}
            />

            <div className="flex flex-col min-h-screen">
                <div className="h-[72px] shrink-0">
                    <Topbar />
                </div>

                <div className="h-14 shrink-0">
                    <Tabs />
                </div>

                <div className="flex-1 min-h-0 p-5 overflow-auto">
                    <SelectedTurbineData
                        selected={selected}
                        setSelected={setSelected}
                    />
                </div>
            </div>
        </div>
    );
}

function SelectedTurbineData({
                                 selected,
                                 setSelected,
                             }: {
    selected: string | null;
    setSelected: Dispatch<SetStateAction<string | null>>;
}) {
    const {
        rows: telemetryRows,
        isLoading: telemetryLoading,
        error: telemetryError,
    } = useTelemetry(FARM.id, selected ?? undefined, 20);

    const {
        alerts,
        isLoading: alertsLoading,
        error: alertsError,
    } = useAlerts(FARM.id, selected ?? undefined, 20);

    return (
        <SelectedTurbine.Provider
            value={{
                selected,
                setSelected,
                farmId: FARM.id,
                telemetryRows,
                telemetryLoading,
                telemetryError,
                alerts,
                alertsLoading,
                alertsError,
            }}
        >
            <Outlet />
        </SelectedTurbine.Provider>
    );
}