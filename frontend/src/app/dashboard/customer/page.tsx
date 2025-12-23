"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, Calendar, ShieldCheck, Clock, MapPin, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        // Check auth
        const userId = localStorage.getItem("user_id");
        const role = localStorage.getItem("user_role");

        if (!userId || role !== "customer") {
            router.push("/login?role=customer");
            return;
        }

        // Fetch data
        const fetchData = async () => {
            try {
                const res = await api.get(`/analytics/${userId}`);
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingData, setBookingData] = useState({ location: "", date: "", package: "Basic" });

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem("user_id");
            await api.post("/inspections", {
                location: bookingData.location,
                scheduled_date: new Date(bookingData.date).toISOString(),
                package: bookingData.package
            }, { params: { customer_id: userId } });
            setShowBookingModal(false);
            alert("Inspection booked successfully!");
            // Refresh logic could go here
        } catch (err) {
            console.error(err);
            alert("Failed to book inspection.");
        }
    };

    // Use API data or fallback to 0
    const stats = [
        { label: "Total Inspections", value: data?.total_inspections || 0, icon: shieldCheckIcon(), color: "bg-blue-500/10 text-blue-500" },
        { label: "Cost Saved", value: `$${data?.cost_saved || 0}`, icon: barChartIcon(), color: "bg-emerald-500/10 text-emerald-500" },
        { label: "Next Inspection", value: data?.next_booking_date ? new Date(data.next_booking_date).toLocaleDateString() : "None", icon: calendarIcon(), color: "bg-purple-500/10 text-purple-500" },
    ];

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Loading Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Welcome back, Customer</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Link href="/dashboard/customer/create-report" className="text-xs text-slate-500 hover:text-white">Mock: Add Report</Link>
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        C
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-slate-800/50 transition-colors">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Reports */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
                        <button onClick={() => router.push("/dashboard/customer/reports")} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
                    </div>
                    {/* Placeholder for now - real list is on the full page */}
                    <div className="space-y-4">
                        <div className="glass-panel p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => router.push("/dashboard/customer/reports")}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Click "View All" to see detailed reports</h4>
                                    <p className="text-xs text-slate-500">With images and defect analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Upcoming Bookings */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-white">Upcoming Missions</h2>
                        <button onClick={() => setShowBookingModal(true)} className="text-sm text-blue-400 hover:text-blue-300">New Booking</button>
                    </div>
                    <div className="space-y-4">
                        {/* Dynamic or static placeholder for mission */}
                        <div className="glass-panel p-5 rounded-xl border-l-4 border-blue-500 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-bold text-white">Wind Turbine Inspection</h4>
                                    <div className="flex items-center text-slate-400 text-sm mt-1">
                                        <MapPin size={14} className="mr-1" /> North Field, Zone 4
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">28</div>
                                    <div className="text-xs text-slate-400 uppercase">Dec</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
                        <h2 className="text-xl font-bold text-white mb-6">Book New Inspection</h2>

                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Location</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" required value={bookingData.location} onChange={e => setBookingData({ ...bookingData, location: e.target.value })} placeholder="e.g. Solar Field A" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Date</label>
                                <input type="datetime-local" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" required value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Package</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Basic", "Advanced", "Premium", "Elite"].map(pkg => (
                                        <div key={pkg} onClick={() => setBookingData({ ...bookingData, package: pkg })}
                                            className={`p-3 rounded border text-center cursor-pointer transition-all ${bookingData.package === pkg ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                            {pkg}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded mt-4">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function shieldCheckIcon() {
    return <ShieldCheck size={24} />;
}
function barChartIcon() {
    return <BarChart3 size={24} />;
}
function calendarIcon() {
    return <Calendar size={24} />;
}
