import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface AvailableResourceItem {
  id: string;
  name: string;
  location: string | null;
  capacity: number | null;
  openTime: string;
  closeTime: string;
  type: { name: string };
}

interface AvailableResourceCardProps {
  resource: AvailableResourceItem;
  bookLink: string;
}

export function AvailableResourceCard({
  resource,
  bookLink,
}: AvailableResourceCardProps) {
  return (
    <div className="bg-card flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all hover:border-blue-500/40 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {resource.type.name}
            </span>
            <h3 className="mt-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {resource.name}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Guaranteed Free</span>
          </span>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{resource.location ?? "No location specified"}</span>
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              {resource.capacity
                ? `${resource.capacity} people`
                : "Any capacity"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>
              {resource.openTime} – {resource.closeTime}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 border-t pt-3.5">
        <Link
          href={bookLink}
          className={buttonVariants({
            size: "sm",
            className:
              "h-10 w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-xs hover:bg-blue-700",
          })}
        >
          <span>Reserve this Room</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
