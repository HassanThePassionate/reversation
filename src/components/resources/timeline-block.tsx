import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import type { TimelineSegment } from "@/lib/services/timeline-segments";

interface TimelineBlockProps {
  segment: TimelineSegment;
}

export function TimelineBlock({ segment }: TimelineBlockProps) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const startStr = formatInTimeZone(segment.start, tz, "HH:mm");
  const endStr = formatInTimeZone(segment.end, tz, "HH:mm");
  const durationMinutes = Math.round(
    (segment.end.getTime() - segment.start.getTime()) / 60000
  );

  if (segment.type === "booked" && segment.reservation) {
    const { title, bookerName } = segment.reservation;
    return (
      <div
        role="region"
        aria-label={`Booked: ${title} by ${bookerName} from ${startStr} to ${endStr}`}
        className="flex flex-col justify-between rounded-lg border-l-4 border-rose-500 bg-rose-500/10 p-3 text-xs sm:flex-row sm:items-center dark:bg-rose-950/20"
      >
        <div className="space-y-0.5">
          <p className="font-semibold text-rose-900 dark:text-rose-100">
            {title}
          </p>
          <p className="text-muted-foreground text-[11px]">
            Booked by{" "}
            <span className="text-foreground font-medium">{bookerName}</span>
          </p>
        </div>
        <div className="mt-2 text-right font-mono text-[11px] text-rose-700 sm:mt-0 dark:text-rose-300">
          <span>
            {startStr} – {endStr}
          </span>
          <span className="text-muted-foreground ml-2">
            ({durationMinutes}m)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={`Available slot from ${startStr} to ${endStr}`}
      className="flex items-center justify-between rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-800 dark:text-emerald-300"
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="font-medium">Available</span>
      </div>
      <div className="font-mono text-[11px]">
        <span>
          {startStr} – {endStr}
        </span>
        <span className="text-muted-foreground ml-2">({durationMinutes}m)</span>
      </div>
    </div>
  );
}
