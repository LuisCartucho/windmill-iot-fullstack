import { useEffect, useRef } from "react";
import { API_BASE } from "../api/http";

// Keep SSE endpoints public (recommended) because EventSource can't send Authorization header easily.
export function useSse(path, onMessage) {
    const cbRef = useRef(onMessage);
    cbRef.current = onMessage;

    useEffect(() => {
        const es = new EventSource(`${API_BASE}${path}`);
        es.onmessage = (e) => {
            try {
                cbRef.current(JSON.parse(e.data));
            } catch {
                // ignore
            }
        };
        es.onerror = () => {
            // auto reconnect happens by browser
        };
        return () => es.close();
    }, [path]);
}
