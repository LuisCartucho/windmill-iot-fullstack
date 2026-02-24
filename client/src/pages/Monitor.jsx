import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";

export default function Monitor() {
    const { selected } = useContext(SelectedTurbine);

    if (!selected) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-72px-56px)] flex items-center justify-center">
                <div className="text-center opacity-80">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-base-200 grid place-items-center">
                        <span className="text-2xl">≋</span>
                    </div>
                    <div className="text-sm text-base-content/60">
                        Select a turbine to begin monitoring
                    </div>
                </div>
            </div>
        );
    }

    return <div>...</div>;
}
