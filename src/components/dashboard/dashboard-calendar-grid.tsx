import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { DashboardCalendarDay } from "@/components/dashboard/dashboard-calendar-day";
import type { getDashboardMonthReservations } from "@/lib/services/dashboard.service";

type CalendarReservation = Awaited<
  ReturnType<typeof getDashboardMonthReservations>
>[number];

interface DashboardCalendarGridProps {
  bookingsByDay: Map<string, CalendarReservation[]>;
  days: Date[];
  gridStart: Date;
  monthDate: Date;
  timezone: string;
  today: string;
}

export function DashboardCalendarGrid({
  bookingsByDay,
  days,
  gridStart,
  monthDate,
  timezone,
  today,
}: DashboardCalendarGridProps) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[650px]">
        <div className="grid grid-cols-7 border-b bg-slate-50/70 dark:bg-slate-900/40">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="text-muted-foreground border-r px-2 py-2.5 text-center text-[10px] font-semibold tracking-wide uppercase last:border-r-0"
            >
              {formatInTimeZone(addDays(gridStart, index), "UTC", "EEE")}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = formatInTimeZone(day, "UTC", "yyyy-MM-dd");
            return (
              <DashboardCalendarDay
                key={key}
                day={day}
                reservations={bookingsByDay.get(key) ?? []}
                monthDate={monthDate}
                timezone={timezone}
                today={today}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
