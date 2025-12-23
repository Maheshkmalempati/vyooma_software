import Link from "next/link";
import { Plane, User, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex absolute top-8 px-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-white/10 bg-black/20 backdrop-blur-md pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200/5 lg:p-4">
          Drone Inspection & Analytics
        </p>
      </div>

      <main className="flex flex-col items-center text-center gap-8 mt-16">
        <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-blue-500 before:to-transparent before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-cyan-400 after:to-transparent after:opacity-10 after:blur-2xl after:content-['']">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 z-10">
            SkyGuard
            <br />
            Analytics
          </h1>
        </div>

        <p className="text-lg text-slate-400 max-w-xl z-10">
          Advanced drone inspection management, live pilot streams, and AI-powered defect classification.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-3xl z-10">
          <Link href="/login?role=customer" className="group relative overflow-hidden rounded-2xl border border-white/10 p-8 hover:border-blue-500/50 transition-all duration-300 glass-panel hover:bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h2 className="text-2xl font-semibold">Customer Login</h2>
              <p className="text-sm text-slate-400">View your inspection reports, analytics, and upcoming bookings.</p>
              <div className="mt-4 flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Proceed <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>

          <Link href="/login?role=pilot" className="group relative overflow-hidden rounded-2xl border border-white/10 p-8 hover:border-emerald-500/50 transition-all duration-300 glass-panel hover:bg-white/5">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Plane size={32} />
              </div>
              <h2 className="text-2xl font-semibold">Pilot Login</h2>
              <p className="text-sm text-slate-400">Access live flight tools, upload data, and defect classification.</p>
              <div className="mt-4 flex items-center text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Proceed <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
