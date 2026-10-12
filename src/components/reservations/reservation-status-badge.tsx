import { CheckCircle, CheckCircle2, XCircle } from "lucide-react";
import { ReservationStatus } from "@prisma/client";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  isCompleted?: boolean;
}

export function ReservationStatusBadge({
  status,
  isCompleted = false,
}: ReservationStatusBadgeProps) {
  if (status === ReservationStatus.CANCELLED) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
        <XCircle className="h-3 w-3" />
        <span>Cancelled</span>
      </span>
    );
  }

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
        <CheckCircle className="h-3 w-3" />
        <span>Completed</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
      <CheckCircle2 className="h-3 w-3" />
      <span>Confirmed</span>
    </span>
  );
}
