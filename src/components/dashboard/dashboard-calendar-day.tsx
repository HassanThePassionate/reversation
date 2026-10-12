import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import type { getDashboardMonthReservations } from "@/lib/services/dashboard.service";

type CalendarReservation = Awaited<
  ReturnType<typeof getDashboardMonthReservations>
>[number];

interface DashboardCalendarDayProps {
  day: Date;
  reservations: CalendarReservation[];
  monthDate: Date;
  timezone: string;
  today: string;
}

const eventColors = [
  "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200",
  "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200",
  "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-200",
] as const;

export function DashboardCalendarDay({
  day,
  reservations,
  monthDate,
  timezone,
  today,
}: DashboardCalendarDayProps) {
  const key = formatInTimeZone(day, "UTC", "yyyy-MM-dd");
  const inMonth = day.getUTCMonth() === monthDate.getUTCMonth();

  return (
    <div
      className={`min-h-24 border-r border-b p-1.5 last:border-r-0 sm:min-h-28 sm:p-2 ${
        inMonth ? "bg-card" : "bg-slate-50/60 dark:bg-slate-900/20"
      }`}
    >
      <div
        className={`mb-1 flex size-6 items-center justify-center rounded-full text-xs ${
          key === today
            ? "bg-blue-600 font-semibold text-white"
            : inMonth
              ? "text-slate-700 dark:text-slate-300"
              : "text-slate-400"
        }`}
      >
        {day.getUTCDate()}
      </div>
      <div className="space-y-1">
        {reservations.slice(0, 2).map((reservation, index) => (
          <Link
            key={reservation.id}
            href={`/resources/${reservation.resource.id}`}
            title={`${reservation.title} · ${reservation.resource.name}`}
            className={`block truncate rounded-md border px-1.5 py-1 text-[10px] leading-tight font-medium ${
              eventColors[index % eventColors.length] ?? eventColors[0]
            }`}
          >
            <span className="hidden sm:inline">
              {formatInTimeZone(reservation.startTime, timezone, "h:mm")}{" "}
            </span>
            {reservation.title}
          </Link>
        ))}
        {reservations.length > 2 && (
          <span className="text-muted-foreground block px-1 text-[10px] font-medium">
            +{reservations.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}
