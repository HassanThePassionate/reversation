import Link from "next/link";
import { ArrowLeft, Clock, Edit2, MapPin, Users } from "lucide-react";
import { ActiveBadge } from "@/components/resources/active-badge";
import { AvailabilityBadge } from "@/components/resources/availability-badge";

export interface ResourceHeaderData {
  id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  type: { name: string };
  availability?: { inUse: boolean; availableAt: Date };
}

export function ResourceHeader({
  resource,
  isAdmin,
}: {
  resource: ResourceHeaderData;
  isAdmin: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {resource.type.name}
            </span>
            <ActiveBadge isActive={resource.isActive} />
            {resource.isActive && resource.availability && (
              <AvailabilityBadge
                inUse={resource.availability.inUse}
                availableAt={resource.availability.availableAt}
              />
            )}
          </div>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {resource.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/resources"
            className="hover:bg-slate-100 text-slate-600 inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Rooms</span>
          </Link>
          {isAdmin && (
            <Link
              href={`/resources/${resource.id}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 text-xs text-slate-500 sm:grid-cols-3 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{resource.location ?? "No location specified"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{resource.capacity ? `${resource.capacity} people` : "Any capacity"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{resource.openTime} – {resource.closeTime}</span>
        </div>
      </div>
    </div>
  );
}
