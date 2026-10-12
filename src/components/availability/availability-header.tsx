import { CalendarSearch } from "lucide-react";

export function AvailabilityHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
        <CalendarSearch className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Find Available Resources
        </h1>
        <p className="text-slate-500 mt-0.5 text-xs">
          Search for rooms and equipment with guaranteed availability.
        </p>
      </div>
    </div>
  );
}

