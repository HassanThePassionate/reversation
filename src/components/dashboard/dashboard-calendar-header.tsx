import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface DashboardCalendarHeaderProps {
  month: string;
  monthDate: Date;
  timezone: string;
}

function shiftMonth(month: string, amount: number) {
  const date = new Date(`${month}-01T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return formatInTimeZone(date, "UTC", "yyyy-MM");
}

export function DashboardCalendarHeader({
  month,
  monthDate,
  timezone,
}: DashboardCalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <CalendarDays className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {formatInTimeZone(monthDate, "UTC", "MMMM yyyy")}
          </h2>
          <p className="text-muted-foreground text-xs">Room reservations</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          href={`?month=${shiftMonth(month, -1)}`}
          aria-label="Previous month"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={`?month=${formatInTimeZone(new Date(), timezone, "yyyy-MM")}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "px-3",
          })}
        >
          Today
        </Link>
        <Link
          href={`?month=${shiftMonth(month, 1)}`}
          aria-label="Next month"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
