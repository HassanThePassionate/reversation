import { getResourceDayTimeline } from "@/lib/services/availability.service";
import { DayTimeline } from "@/components/resources/day-timeline";

interface TimelineSectionProps {
  resourceId: string;
  date: string;
}

export async function TimelineSection({
  resourceId,
  date,
}: TimelineSectionProps) {
  const timeline = await getResourceDayTimeline(resourceId, date);
  return (
    <DayTimeline
      date={timeline.date}
      openTime={timeline.resource.openTime}
      closeTime={timeline.resource.closeTime}
      segments={timeline.segments}
    />
  );
}

export function TimelineSkeleton() {
  return (
    <div className="bg-card animate-pulse space-y-4 rounded-xl border p-6 shadow-xs">
      <div className="bg-muted h-8 w-48 rounded-md" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
