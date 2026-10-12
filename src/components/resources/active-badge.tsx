import { CheckCircle2, XCircle } from "lucide-react";

interface ActiveBadgeProps {
  isActive: boolean;
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">
        <CheckCircle2 className="h-3 w-3" />
        <span>Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
      <XCircle className="h-3 w-3" />
      <span>Inactive</span>
    </span>
  );
}
