export const API_BASE: string =
    import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

const TOKEN_KEY = "token";
const NICKNAME_KEY = "nickname";
const LAST_ACTIVITY_KEY = "lastActivityAt";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

type JwtPayload = {
    sub?: string;
    unique_name?: string;
    nickname?: string;
    exp?: number;
    [key: string]: unknown;
};

export function getToken(): string | null {
    if (isSessionExpired()) {
        clearAuthSession();
        return null;
    }

    return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

export function setNickname(nickname: string) {
    sessionStorage.setItem(NICKNAME_KEY, nickname);
}

export function getNickname(): string | null {
    return sessionStorage.getItem(NICKNAME_KEY);
}

export function clearNickname() {
    sessionStorage.removeItem(NICKNAME_KEY);
}

export function touchAuthActivity() {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

export function getLastActivity(): number | null {
    const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;

    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
}

export function clearLastActivity() {
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function isSessionExpired(): boolean {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    const lastActivity = getLastActivity();
    if (!lastActivity) return true;

    return Date.now() - lastActivity > IDLE_TIMEOUT_MS;
}

export function clearAuthSession() {
    clearToken();
    clearNickname();
    clearLastActivity();
}

export function setAuthSession(token: string, nickname?: string) {
    setToken(token);

    if (nickname) {
        setNickname(nickname);
    } else {
        clearNickname();
    }

    touchAuthActivity();
}

function parseJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
        );

        const json = atob(padded);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

export function getTokenPayload(): JwtPayload | null {
    const token = getToken();
    if (!token) return null;

    return parseJwt(token);
}

export function getCurrentUserId(): string | null {
    const payload = getTokenPayload();
    return payload?.sub ?? payload?.unique_name ?? null;
}

export function isOperator(): boolean {
    return getCurrentUserId() === "operator";
}

export function isAdmin(): boolean {
    return getCurrentUserId() === "admin";
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export async function apiFetch(
    path: string,
    options: RequestInit = {}
): Promise<any> {
    const headers = new Headers(options.headers ?? {});
    const hasBody = options.body !== undefined && options.body !== null;

    if (hasBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    const token = getToken();
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        touchAuthActivity();
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        clearAuthSession();
        throw new Error("Unauthorized");
    }

    if (res.status === 403) {
        throw new Error("Forbidden");
    }

    if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let message = `HTTP ${res.status}`;

        if (contentType.includes("application/json")) {
            const data = await res.json().catch(() => null);
            message =
                data?.error ||
                data?.message ||
                JSON.stringify(data) ||
                message;
        } else {
            const text = await res.text().catch(() => "");
            message = text || message;
        }

        throw new Error(message);
    }

    if (res.status === 204) {
        return null;
    }

    const ct = res.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
        return res.json();
    }

    return res.text();
}