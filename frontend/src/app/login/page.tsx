"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get("role") || "customer"; // default to customer

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/login", { email, password });

            const userData = res.data;

            // Look for role mismatch (simplified check, backend doesn't enforce this on login but frontend should redirect)
            if (userData.role !== role) {
                setError(`This account is for ${userData.role}s, but you are trying to login as a ${role}.`);
                setLoading(false);
                return;
            }

            // Store in localStorage (Simple auth for demo)
            localStorage.setItem("user_id", userData.user_id);
            localStorage.setItem("user_role", userData.role);

            // Redirect
            if (role === "customer") {
                router.push("/dashboard/customer");
            } else {
                router.push("/dashboard/pilot");
            }

        } catch (err: any) {
            console.error(err);
            if (err.response) {
                setError(err.response.data.detail || "Login failed");
            } else {
                setError("Could not connect to server. Ensure backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid items-center justify-center p-4 bg-slate-950">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
                {/* Ambient background glow */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${role === 'pilot' ? 'from-emerald-500 to-green-500' : 'from-blue-500 to-cyan-500'}`} />

                <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-2 capitalize">{role} Login</h1>
                <p className="text-slate-400 mb-8">Enter your credentials to access the portal.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center
              ${role === 'pilot'
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-500/20'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                            }`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </button>

                    <div className="text-center mt-4">
                        <Link href={`/register?role=${role}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                            Don't have an account? <span className="underline">Create one</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
