import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface ReservationEmptyStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ReservationEmptyState({
  title = "No reservations found",
  description = "No reservations match your current filters. Try selecting a different date or status.",
  actionHref = "/resources",
  actionLabel = "Browse Rooms",
}: ReservationEmptyStateProps) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
        <CalendarDays className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 mt-1 max-w-sm text-xs">
        {description}
      </p>

      {actionHref && (
        <div className="mt-5">
          <Link
            href={actionHref}
            className={buttonVariants({
              size: "sm",
              className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-xs",
            })}
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
