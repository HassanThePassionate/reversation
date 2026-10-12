import { CalendarX } from "lucide-react";
import { AvailableResourceCard } from "@/components/availability/available-resource-card";
import type { findAvailableResources } from "@/lib/services/availability.service";

interface AvailabilityResultsProps {
  resources: Awaited<ReturnType<typeof findAvailableResources>>;
  queryTime: string;
  formattedEndTime: string;
  queryDate: string;
  startLocal: string;
  endLocal: string;
}

export function AvailabilityResults({
  resources,
  queryTime,
  formattedEndTime,
  queryDate,
  startLocal,
  endLocal,
}: AvailabilityResultsProps) {
  if (resources.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
          <CalendarX className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          Nothing free, try another time
        </h2>
        <p className="text-slate-500 mt-1 max-w-sm text-xs">
          No active resources are available for the requested slot from{" "}
          <strong className="text-slate-700 dark:text-slate-300">{queryTime}</strong> to{" "}
          <strong className="text-slate-700 dark:text-slate-300">{formattedEndTime}</strong>. Try shortening the duration or selecting a different slot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          {resources.length} Available {resources.length === 1 ? "Room" : "Rooms"} Found
        </h2>
        <span className="text-xs text-slate-400">
          {queryTime} – {formattedEndTime}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((res) => (
          <AvailableResourceCard
            key={res.id}
            resource={res}
            bookLink={`/resources/${res.id}?date=${queryDate}&startTime=${startLocal}&endTime=${endLocal}`}
          />
        ))}
      </div>
    </div>
  );
}
