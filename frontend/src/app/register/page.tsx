"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import api from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") || "customer";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(roleParam);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/register", {
                name,
                email,
                password,
                role
            });

            // Auto redirect to login after success
            router.push(`/login?role=${role}`);

        } catch (err: any) {
            console.error(err);
            if (err.response) {
                setError(err.response.data.detail || "Registration failed");
            } else {
                setError("Could not connect to server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid items-center justify-center p-4 bg-slate-950">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${role === 'pilot' ? 'from-emerald-500 to-green-500' : 'from-blue-500 to-cyan-500'}`} />

                <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-slate-400 mb-8">Join SkyGuard Analytics today.</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="name@example.com"
                            required
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
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("customer")}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'customer' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("pilot")}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'pilot' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                            >
                                Pilot
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
              ${role === 'pilot'
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-500/20'
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20'
                            }`}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus size={18} /> Create Account</>}
                    </button>

                    <div className="text-center mt-4">
                        <Link href={`/login?role=${role}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                            Already have an account? <span className="underline">Sign In</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
