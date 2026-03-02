import { useState } from "react";
import { apiFetch } from "../api/http";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });
            localStorage.setItem("token", res.token);
            nav("/app", { replace: true }); // <-- adjust if your protected routes are /app/...
        } catch (e2) {
            setErr(e2.message);
        }
    }

    return (
        <div className="min-h-screen w-full grid place-items-center bg-[#0b0c0e] p-6">
            <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7">
                <div className="mx-auto mb-4 h-11 w-11 rounded-xl grid place-items-center border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                    <span className="text-lg">≋</span>
                </div>

                <div className="text-center">
                    <div className="text-white/90 font-semibold text-lg">FS+IoT Corporate™</div>
                    <div className="text-white/55 text-xs mt-1">Windmill Inspection Centre</div>
                </div>

                <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                    <label className="form-control w-full">
                        <div className="label py-0 mb-1">
                            <span className="label-text text-[10px] tracking-[0.14em] text-white/45">USERNAME</span>
                        </div>
                        <input
                            className="input w-full bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            autoComplete="username"
                        />
                    </label>

                    <label className="form-control w-full">
                        <div className="label py-0 mb-1">
    <span className="label-text text-[10px] tracking-[0.14em] text-white/45">
      PASSWORD
    </span>
                        </div>

                        <div className="relative">
                            <input
                                className="input w-full bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none pr-12"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <button type="submit" className="btn btn-success w-full rounded-xl text-white font-semibold">
                        Sign In
                    </button>

                    {err && <div className="text-center text-sm text-red-400">{err}</div>}
                </form>
            </div>
        </div>
    );
}