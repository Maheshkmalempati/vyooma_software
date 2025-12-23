"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2, MapPin, Tag, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            router.push("/login");
            return;
        }

        api.get(`/reports/customer/${userId}`)
            .then(res => setReports(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Reports...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <Link href="/dashboard/customer" className="text-slate-400 hover:text-white mb-6 inline-flex items-center"><ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard</Link>

            <h1 className="text-3xl font-bold text-white mb-8">All Inspection Reports</h1>

            {reports.length === 0 ? (
                <div className="text-slate-500">No reports found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} onClick={() => setSelectedReport(report)} className="glass-panel p-6 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{report.title}</h3>
                                    <p className="text-sm text-slate-500">{new Date(report.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm line-clamp-2">{report.summary}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

                        <h2 className="text-2xl font-bold text-white mb-2">{selectedReport.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                            <span>ID: #{selectedReport.id}</span>
                            <span>•</span>
                            <span>{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                        </div>

                        {selectedReport.image_url ? (
                            <div className="aspect-video relative rounded-xl overflow-hidden mb-6 bg-slate-950 border border-slate-800">
                                {/* Using normal img for external URLs or dynamic content often easier than Next/Image for unknown domains unless configured */}
                                <img src={selectedReport.image_url} alt="Defect" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="aspect-video relative rounded-xl overflow-hidden mb-6 bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                                No Image Available
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Tag size={16} /> Defect Type</div>
                                <div className="text-white font-medium">{selectedReport.defect_classification || "N/A"}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><Activity size={16} /> Confidence</div>
                                <div className="text-white font-medium">{selectedReport.confidence ? `${selectedReport.confidence}%` : "N/A"}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1"><FileText size={16} /> ID</div>
                                <div className="text-white font-medium">#{selectedReport.inspection_id}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                            <p className="text-slate-300 leading-relaxed">{selectedReport.summary}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
