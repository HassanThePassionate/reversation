import Link from "next/link";
import { Clock, DoorOpen, User } from "lucide-react";

interface DashboardReservationItemProps {
  id: string;
  title: string;
  timeLabel: string;
  resourceId: string;
  resourceName: string;
  userName?: string;
}

export function DashboardReservationItem({
  title,
  timeLabel,
  resourceId,
  resourceName,
  userName,
}: DashboardReservationItemProps) {
  return (
    <div className="bg-slate-50/70 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 p-3 text-xs transition dark:bg-slate-900/40 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-slate-800 dark:text-slate-100">
          {title}
        </span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500 shrink-0">
          <Clock className="h-3 w-3 text-slate-400" />
          {timeLabel}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <Link
          href={`/resources/${resourceId}`}
          className="flex items-center gap-1 font-medium text-blue-600 hover:underline"
        >
          <DoorOpen className="h-3 w-3" />
          {resourceName}
        </Link>
        {userName && (
          <span className="flex items-center gap-1 text-slate-400">
            <User className="h-3 w-3" />
            {userName}
          </span>
        )}
      </div>
    </div>
  );
}
