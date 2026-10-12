import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { getDashboardUtilization } from "@/lib/services/dashboard.service";

export async function DashboardUtilization() {
  const rows = await getDashboardUtilization();
  const maxHours = Math.max(...rows.map((r) => r.bookedHours), 1);

  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Weekly Utilization
            </h2>
            <p className="text-xs text-slate-500">
              Past 7 days booked hours
            </p>
          </div>
        </div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>Rooms</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 space-y-3.5">
        {rows.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">
            No active resources found.
          </p>
        ) : (
          rows.map((row) => {
            const pct = Math.min(
              100,
              Math.round((row.bookedHours / maxHours) * 100)
            );
            return (
              <div key={row.resourceId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/resources/${row.resourceId}`}
                    className="hover:text-blue-600 truncate font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    {row.resourceName}
                  </Link>
                  <span className="text-slate-500 shrink-0 pl-2 font-mono text-[11px]">
                    {row.bookedHours}h
                  </span>
                </div>
                <div
                  className="bg-slate-100 dark:bg-slate-800 h-2 w-full overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuenow={row.bookedHours}
                  aria-valuemin={0}
                  aria-valuemax={maxHours}
                >
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        row.bookedHours > 0 ? `${Math.max(pct, 4)}%` : "0%",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
