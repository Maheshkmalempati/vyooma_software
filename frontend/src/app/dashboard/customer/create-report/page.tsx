"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

export default function CreateReportPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [defect, setDefect] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [confidence, setConfidence] = useState("");
    const [inspectionId, setInspectionId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/reports", {
                inspection_id: parseInt(inspectionId),
                title,
                summary,
                defect_classification: defect,
                image_url: imageUrl,
                confidence: parseInt(confidence)
            });
            router.push("/dashboard/customer/reports");
        } catch (err) {
            console.error(err);
            alert("Failed to create report. Ensure Inspection ID exists.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <div className="glass-panel w-full max-w-lg p-8 rounded-2xl">
                <Link href="/dashboard/customer" className="text-slate-400 hover:text-white mb-6 inline-flex items-center"><ArrowLeft className="mr-2 w-4 h-4" /> Back</Link>
                <h1 className="text-2xl font-bold text-white mb-6">Create Mock Report</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="number" placeholder="Inspection ID (Must match an existing Inspection)" value={inspectionId} onChange={e => setInspectionId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" required />
                    <input type="text" placeholder="Report Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" required />
                    <textarea placeholder="Summary" value={summary} onChange={e => setSummary(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" />
                    <input type="text" placeholder="Defect Type (e.g. Crack)" value={defect} onChange={e => setDefect(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" />
                    <input type="text" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" />
                    <input type="number" placeholder="Confidence %" value={confidence} onChange={e => setConfidence(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded text-white" />

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold flex justify-center">
                        {loading ? <Loader2 className="animate-spin" /> : "Create Report"}
                    </button>
                </form>
            </div>
        </div>
    )
}
