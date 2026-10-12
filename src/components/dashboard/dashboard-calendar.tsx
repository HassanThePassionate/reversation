import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Clock3 } from "lucide-react";
import { DashboardCalendarGrid } from "@/components/dashboard/dashboard-calendar-grid";
import { DashboardCalendarHeader } from "@/components/dashboard/dashboard-calendar-header";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { getDashboardMonthReservations } from "@/lib/services/dashboard.service";
import type { CurrentUser } from "@/lib/services/user.service";

interface DashboardCalendarProps {
  month: string;
  user: CurrentUser;
}

export async function DashboardCalendar({
  month,
  user,
}: DashboardCalendarProps) {
  const timezone = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const reservations = await getDashboardMonthReservations(user, month);
  const [year, monthNumber] = month.split("-").map(Number);
  const monthDate = new Date(Date.UTC(year ?? 0, (monthNumber ?? 1) - 1, 1));
  const firstWeekday = monthDate.getUTCDay();
  const daysInMonth = new Date(
    Date.UTC(year ?? 0, monthNumber ?? 1, 0)
  ).getUTCDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const gridStart = addDays(monthDate, -firstWeekday);
  const days = Array.from({ length: cellCount }, (_, index) =>
    addDays(gridStart, index)
  );
  const today = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  const bookingsByDay = new Map<string, typeof reservations>();

  for (const reservation of reservations) {
    const day = formatInTimeZone(reservation.startTime, timezone, "yyyy-MM-dd");
    bookingsByDay.set(day, [...(bookingsByDay.get(day) ?? []), reservation]);
  }

  return (
    <section className="bg-card overflow-hidden rounded-2xl border shadow-xs">
      <DashboardCalendarHeader
        month={month}
        monthDate={monthDate}
        timezone={timezone}
      />
      <DashboardCalendarGrid
        bookingsByDay={bookingsByDay}
        days={days}
        gridStart={gridStart}
        monthDate={monthDate}
        timezone={timezone}
        today={today}
      />
      <div className="text-muted-foreground flex items-center justify-between gap-3 px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Times shown in {timezone}
        </span>
        <span>{reservations.length} confirmed</span>
      </div>
    </section>
  );
}
