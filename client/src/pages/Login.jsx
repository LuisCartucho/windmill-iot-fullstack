import { useState } from "react";
import { apiFetch } from "../api/http";
import { useNavigate } from "react-router";

export default function Login() {
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            localStorage.setItem("token", res.token);
            nav("/control");
        } catch (e2) {
            setErr(e2.message);
        }
    }

    return (
        <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420, padding: 16, borderRadius: 22 }}>
            <h2 style={{ marginTop: 0 }}>Login</h2>
            <div className="muted" style={{ marginBottom: 12 }}>Commands require authentication.</div>

            <div style={{ display: "grid", gap: 10 }}>
                <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
                <button className="btn btn-green" type="submit">Login</button>
                {err && <div style={{ color: "#ff7a7a" }}>{err}</div>}
            </div>
        </form>
    );
}
