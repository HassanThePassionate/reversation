import { CheckCircle2, Clock } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";

interface AvailabilityBadgeProps {
  inUse: boolean;
  availableAt: Date;
}

export function AvailabilityBadge({
  inUse,
  availableAt,
}: AvailabilityBadgeProps) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const timeStr = formatInTimeZone(availableAt, tz, "HH:mm");

  if (inUse) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        <span>In use until {timeStr}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      <span>Free now</span>
    </span>
  );
}
