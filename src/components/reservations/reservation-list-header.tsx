import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ReservationListHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meeting Reservations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse, filter, reschedule, and manage meeting room bookings
        </p>
      </div>
      <Link
        href="/availability"
        className={buttonVariants({
          size: "sm",
          className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-xs",
        })}
      >
        <CalendarPlus className="h-4 w-4" />
        <span>New Booking</span>
      </Link>
    </div>
  );
}
