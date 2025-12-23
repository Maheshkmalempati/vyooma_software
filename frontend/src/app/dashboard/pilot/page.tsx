"use client";

import { useState, useEffect } from "react";
import { Loader, Upload, AlertTriangle, CheckCircle, Video, Radio } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PilotDashboard() {
    const router = useRouter();
    const [isStreaming, setIsStreaming] = useState(true);
    const [inspections, setInspections] = useState<any[]>([]);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const role = localStorage.getItem("user_role");

        if (!userId || role !== "pilot") {
            router.push("/login?role=pilot");
            return;
        }

        api.get(`/inspections`, { params: { user_id: userId, user_role: role } })
            .then(res => setInspections(res.data))
            .catch(err => console.error(err));
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 flex flex-col gap-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Radio className="text-red-500 animate-pulse" /> Mission Control
                    </h1>
                    <p className="text-slate-400 text-sm">Live Flight Deck</p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-mono border border-emerald-500/20">
                    SYSTEM ONLINE
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Live Feed Column */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                        {/* Simulated Live Feed Overlay */}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div> Live
                            </span>
                            <span className="px-2 py-0.5 bg-black/50 text-white text-[10px] font-mono rounded backdrop-blur">
                                BAT: 84%
                            </span>
                            <span className="px-2 py-0.5 bg-black/50 text-white text-[10px] font-mono rounded backdrop-blur">
                                ALT: 45m
                            </span>
                        </div>

                        {/* Placeholder Image/Video */}
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:40px_40px] [background-position:center] opacity-20"></div>

                            {/* Crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <div className="w-[200px] h-[200px] border border-white/50 rounded-full flex items-center justify-center">
                                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                </div>
                                <div className="absolute w-full h-[1px] bg-white/20"></div>
                                <div className="absolute h-full w-[1px] bg-white/20"></div>
                            </div>

                            <p className="text-slate-500 font-mono text-xs">NO SIGNAL / SIMULATION MODE</p>
                        </div>

                        {/* Detect Overlay */}
                        <div className="absolute bottom-4 right-4 z-10">
                            <div className="bg-black/60 backdrop-blur p-3 rounded-lg border border-red-500/50">
                                <p className="text-red-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Defect Detected
                                </p>
                                <p className="text-white text-sm font-mono">Crack: Structure B4</p>
                                <p className="text-slate-400 text-[10px]">Confidence: 94%</p>
                            </div>
                        </div>
                    </div>

                    {/* ML Classification Panel */}
                    <div className="glass-panel p-4 rounded-xl">
                        <h3 className="text-sm font-semibold text-white mb-3">Real-time Classification</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="min-w-[100px] h-[80px] bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-700">
                                    <div className="w-8 h-8 bg-slate-700 rounded mb-2"></div>
                                    <span className="text-[10px] text-slate-400">Frame #{1024 + i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls Column */}
                <div className="flex flex-col gap-4">
                    {/* Upload Data Card */}
                    <div className="glass-panel p-5 rounded-2xl">
                        <h3 className="text-white font-semibold mb-4">Data Collection</h3>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Video size={16} /> Start Recording
                            </button>
                            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700">
                                <Upload size={16} /> Upload Flight Logs
                            </button>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="glass-panel p-5 rounded-2xl flex-1">
                        <h3 className="text-white font-semibold mb-4">Pre-Flight Checklist</h3>
                        <div className="space-y-2">
                            {["Battery Check (>80%)", "GPS Signal Lock", "Propellers Secure", "Camera Clean", "Airspace Clear"].map((item, i) => (
                                <label key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-slate-500 group-hover:border-emerald-500 transition-colors"></div>
                                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
