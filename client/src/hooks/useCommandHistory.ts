import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/http";

export type CommandItem = {
    id: string;
    farmId: string;
    turbineId: string;
    userId: string;
    userNickname: string;
    timestamp: string;
    action: string;
    payload: string;
};

const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const DEFAULT_TAKE = 20;

const commandHistoryCache = new Map<string, CommandItem[]>();

function normalizeTurbineId(value?: string | null) {
    if (!value) return "";
    const v = value.trim().toLowerCase();
    return v.startsWith("turbine-") ? v : `turbine-${v}`;
}

function cacheKey(farmId?: string, turbineId?: string, take?: number) {
    return `${farmId ?? "all"}::${normalizeTurbineId(turbineId) || "all"}::${take ?? DEFAULT_TAKE}`;
}

function commandKey(item: CommandItem) {
    return [
        item.id ?? "",
        item.farmId ?? "",
        normalizeTurbineId(item.turbineId),
        item.userId ?? "",
        item.timestamp ?? "",
        item.action ?? "",
        item.payload ?? "",
    ].join("|");
}

function dedupeCommands(items: CommandItem[]) {
    const map = new Map<string, CommandItem>();

    for (const item of items) {
        map.set(commandKey(item), item);
    }

    return Array.from(map.values()).sort((a, b) => {
        const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
        const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
        return tb - ta;
    });
}

export function useCommandHistory(
    farmId?: string,
    turbineId?: string,
    take: number = DEFAULT_TAKE
) {
    const [items, setItems] = useState<CommandItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!API_BASE) {
            setError("VITE_API_BASE is missing");
            setIsLoading(false);
            return;
        }

        if (!turbineId) {
            setItems([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        requestIdRef.current += 1;
        const requestId = requestIdRef.current;

        const selectedTurbine = normalizeTurbineId(turbineId);
        const key = cacheKey(farmId, turbineId, take);
        const cached = commandHistoryCache.get(key);

        setItems(cached ?? []);
        setIsLoading(!cached);
        setError(null);

        let disposed = false;
        const abortController = new AbortController();

        void (async () => {
            try {
                const data = await apiFetch(
                    `/api/commands?farmId=${encodeURIComponent(farmId ?? "")}&turbineId=${encodeURIComponent(turbineId ?? "")}&take=${take}`,
                    {
                        signal: abortController.signal,
                    }
                );

                if (disposed || requestIdRef.current !== requestId) return;

                const filtered = (Array.isArray(data) ? data : []).filter(
                    (item: CommandItem) =>
                        normalizeTurbineId(item.turbineId) === selectedTurbine
                );

                const next = dedupeCommands(filtered);
                commandHistoryCache.set(key, next);
                setItems(next);
                setIsLoading(false);
                setError(null);
            } catch (e: any) {
                if (disposed || requestIdRef.current !== requestId) return;
                if (e?.name === "AbortError") return;

                setIsLoading(false);
                setError("Failed to load command history");
            }
        })();

        return () => {
            disposed = true;
            abortController.abort();
        };
    }, [farmId, turbineId, take]);

    return { items, isLoading, error };
}