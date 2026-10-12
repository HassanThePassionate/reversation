import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, DoorOpen } from "lucide-react";
import { getDashboardResourceStatus } from "@/lib/services/dashboard.service";

export async function DashboardResourceStatus() {
  const { freeCount, inUseCount, totalCount } =
    await getDashboardResourceStatus();

  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            Live Room Status
          </h2>
        </div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>Rooms</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3.5 text-center dark:bg-emerald-950/20 dark:border-emerald-800/40">
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {freeCount}
          </p>
          <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            Free Now
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-3.5 text-center dark:bg-amber-950/20 dark:border-amber-800/40">
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {inUseCount}
          </p>
          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
            In Use
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-center dark:bg-slate-900/50">
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <DoorOpen className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            {totalCount}
          </p>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Total Active
          </p>
        </div>
      </div>
    </div>
  );
}
