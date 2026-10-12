import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Building2, CalendarPlus, Plus } from "lucide-react";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { DashboardReservations } from "@/components/dashboard/dashboard-reservations";
import { DashboardResourceStatus } from "@/components/dashboard/dashboard-resource-status";
import { DashboardUtilization } from "@/components/dashboard/dashboard-utilization";
import {
  ReservationsSkeleton,
  ResourceStatusSkeleton,
  UtilizationSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth/guards";
import { formatInTimeZone } from "date-fns-tz";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardPageProps {
  searchParams: Promise<{ month?: string | string[] }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const queryMonth = params.month;
  const month =
    typeof queryMonth === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(queryMonth)
      ? queryMonth
      : formatInTimeZone(new Date(), tz, "yyyy-MM");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">
              Welcome back, {user.name}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Room calendar</h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Keep your team&apos;s spaces and schedule in sync.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/availability"
            className={buttonVariants({
              className: "gap-1.5 bg-blue-600 text-white hover:bg-blue-700",
            })}
          >
            <CalendarPlus className="size-4" aria-hidden="true" />
            Book a room
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/resources/new"
              aria-label="Add a room"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <Plus className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <Suspense
          fallback={
            <div className="bg-muted h-[640px] animate-pulse rounded-2xl" />
          }
        >
          <DashboardCalendar month={month} user={user} />
        </Suspense>
        <aside className="space-y-5">
          <Suspense fallback={<ResourceStatusSkeleton />}>
            <DashboardResourceStatus />
          </Suspense>
          <Suspense fallback={<ReservationsSkeleton />}>
            <DashboardReservations user={user} />
          </Suspense>
          <Suspense fallback={<UtilizationSkeleton />}>
            <DashboardUtilization />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
