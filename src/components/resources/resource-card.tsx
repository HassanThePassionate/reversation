import Link from "next/link";
import { ArrowRight, Clock, MapPin, Users } from "lucide-react";
import { ActiveBadge } from "@/components/resources/active-badge";
import { DeactivateDialog } from "@/components/resources/deactivate-dialog";

export interface ResourceCardItem {
  id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  type: { id: string; name: string };
  _count: { reservations: number };
}

interface ResourceCardProps {
  resource: ResourceCardItem;
  isAdmin: boolean;
}

export function ResourceCard({ resource, isAdmin }: ResourceCardProps) {
  return (
    <div className="bg-card group hover:border-blue-500/40 hover:shadow-md flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {resource.type.name}
            </span>
            <h3 className="mt-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
              <Link href={`/resources/${resource.id}`} className="hover:text-blue-600 transition-colors">
                {resource.name}
              </Link>
            </h3>
          </div>
          <ActiveBadge isActive={resource.isActive} />
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resource.location ?? "No location set"}</span>
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

      <div className="mt-5 flex items-center justify-between border-t pt-3.5">
        <Link
          href={`/resources/${resource.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <span>Schedule</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <Link
              href={`/resources/${resource.id}/edit`}
              className="hover:bg-slate-100 text-slate-600 inline-flex h-7 items-center rounded-lg border px-2 text-xs font-medium transition dark:text-slate-300"
            >
              Edit
            </Link>
            <DeactivateDialog
              resourceId={resource.id}
              resourceName={resource.name}
              isActive={resource.isActive}
              futureReservationsCount={resource._count.reservations}
            />
          </div>
        )}
      </div>
    </div>
  );
}
