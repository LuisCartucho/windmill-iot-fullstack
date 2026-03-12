import { useState } from "react";
import { apiFetch, setAuthSession } from "../api/http";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png"

export default function Login() {
    const nav = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr("");

        if (!username.trim() || !password.trim()) {
            setErr("Username and password are required.");
            return;
        }

        try {
            setIsSubmitting(true);

            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            if (!res?.token) {
                throw new Error("Login failed: token missing.");
            }

            setAuthSession(res.token, res.nickname ?? "");
            nav("/app", { replace: true });
        } catch (e: any) {
            setErr(e?.message ?? "Login failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="grid min-h-screen w-full place-items-center bg-[#0b0c0e] p-6">
            <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                    <span className="text-lg">
                        <img
                        src={logo}
                        alt="Windmill logo"
                        className="h-full w-full object-contain"
                    /></span>
                </div>

                <div className="text-center">
                    <div className="text-lg font-semibold text-white/90">
                        FS+IoT Corporate™
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                        Windmill Inspection Centre
                    </div>
                </div>

                <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                    <label className="form-control w-full">
                        <div className="label mb-1 py-0">
                            <span className="label-text text-[10px] tracking-[0.14em] text-white/45">
                                USERNAME
                            </span>
                        </div>

                        <input
                            className="input w-full border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            autoComplete="username"
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className="form-control w-full">
                        <div className="label mb-1 py-0">
                            <span className="label-text text-[10px] tracking-[0.14em] text-white/45">
                                PASSWORD
                            </span>
                        </div>

                        <div className="relative">
                            <input
                                className="input w-full border-white/10 bg-white/5 pr-12 text-white placeholder-white/30 focus:border-emerald-400/50 focus:outline-none"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={isSubmitting}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
                                disabled={isSubmitting}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-success w-full rounded-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "Signing In..." : "Sign In"}
                    </button>

                    {err && (
                        <div className="text-center text-sm text-red-400">
                            {err}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}