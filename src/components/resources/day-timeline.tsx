import { DateNav } from "@/components/resources/date-nav";
import { TimelineBlock } from "@/components/resources/timeline-block";
import type { TimelineSegment } from "@/lib/services/timeline-segments";

interface DayTimelineProps {
  date: string;
  openTime: string;
  closeTime: string;
  segments: TimelineSegment[];
}

export function DayTimeline({
  date,
  openTime,
  closeTime,
  segments,
}: DayTimelineProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-xs">
      <DateNav currentDate={date} />

      <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
        <h2 className="text-foreground text-sm font-semibold">Day Schedule</h2>
        <span>
          Operating: {openTime} – {closeTime}
        </span>
      </div>

      <div className="mt-4 space-y-2.5" role="list" aria-label="Daily schedule">
        {segments.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-xs">
            No operating hours configured for this day.
          </div>
        ) : (
          segments.map((segment, index) => (
            <TimelineBlock
              key={`${segment.start.toISOString()}-${index}`}
              segment={segment}
            />
          ))
        )}
      </div>
    </div>
  );
}
