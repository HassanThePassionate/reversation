import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";

interface DateNavProps {
  currentDate: string;
}

export function DateNav({ currentDate }: DateNavProps) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const currDateObj = fromZonedTime(`${currentDate}T12:00:00`, tz);

  const prevDateObj = new Date(currDateObj.getTime() - 24 * 60 * 60 * 1000);
  const nextDateObj = new Date(currDateObj.getTime() + 24 * 60 * 60 * 1000);

  const prevDateStr = formatInTimeZone(prevDateObj, tz, "yyyy-MM-dd");
  const nextDateStr = formatInTimeZone(nextDateObj, tz, "yyyy-MM-dd");
  const todayStr = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");

  const btnLinkClass =
    "hover:bg-slate-100 text-slate-700 inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-center gap-2">
        <Link href={`?date=${prevDateStr}`} aria-label="Previous day" className={btnLinkClass}>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </Link>
        <Link href={`?date=${todayStr}`} className={btnLinkClass}>
          <Calendar className="h-3.5 w-3.5 text-blue-600" />
          <span>Today</span>
        </Link>
        <Link href={`?date=${nextDateStr}`} aria-label="Next day" className={btnLinkClass}>
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <form method="get" className="flex items-center gap-2">
        <input
          id="date-input"
          type="date"
          name="date"
          defaultValue={currentDate}
          aria-label="Select date"
          className="bg-white h-8 rounded-lg border border-slate-200 px-2 text-xs focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:outline-none dark:bg-slate-900 dark:border-slate-800"
        />
        <Button type="submit" variant="secondary" size="sm" className="h-8 rounded-lg">
          Go
        </Button>
      </form>
    </div>
  );
}
