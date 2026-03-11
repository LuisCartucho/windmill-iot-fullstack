import { useContext } from "react";
import { SelectedTurbine } from "../layout/Shell";
import CommandHistoryList from "../components/command-history/CommandHistoryList";
import { useCommandHistory } from "../hooks/useCommandHistory";

export default function CommandHistory() {
    const ctx = useContext(SelectedTurbine);
    const selected = ctx?.selected ?? undefined;
    const farmId = ctx?.farmId ?? undefined;

    const { items, isLoading, error } = useCommandHistory(farmId, selected, 20);

    return (
        <div className="h-full w-full px-6 py-5 text-white">
            <div className="mb-5">
                <h2 className="text-3xl font-semibold">Command History</h2>
            </div>

            <CommandHistoryList
                items={items}
                loading={isLoading}
                err={error ?? ""}
            />
        </div>
    );
}