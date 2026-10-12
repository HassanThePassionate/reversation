import Link from "next/link";
import { CalendarCheck, CalendarPlus, PlusCircle, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface DashboardQuickActionsProps {
  isAdmin: boolean;
}

export function DashboardQuickActions({ isAdmin }: DashboardQuickActionsProps) {
  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
        Quick Actions
      </h2>
      <div className="mt-3.5 flex flex-wrap gap-2.5">
        <Link
          href="/availability"
          className={buttonVariants({
            size: "sm",
            className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-xs",
          })}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Find Available</span>
        </Link>
        <Link
          href="/resources"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "h-9 gap-1.5 rounded-xl text-slate-700 dark:text-slate-200",
          })}
        >
          <CalendarPlus className="h-3.5 w-3.5 text-blue-600" />
          <span>Browse Rooms</span>
        </Link>
        <Link
          href="/reservations/mine"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "h-9 gap-1.5 rounded-xl text-slate-700 dark:text-slate-200",
          })}
        >
          <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>My Bookings</span>
        </Link>
        {isAdmin && (
          <Link
            href="/resources/new"
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className: "h-9 gap-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
            })}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Room</span>
          </Link>
        )}
      </div>
    </div>
  );
}
