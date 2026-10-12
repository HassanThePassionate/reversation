import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { env } from "@/lib/env";
import { getDashboardReservations } from "@/lib/services/dashboard.service";
import type { CurrentUser } from "@/lib/services/user.service";
import { DashboardReservationColumn } from "@/components/dashboard/dashboard-reservation-column";

interface DashboardReservationsProps {
  user: CurrentUser;
}

export async function DashboardReservations({
  user,
}: DashboardReservationsProps) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const { upcomingReservations } = await getDashboardReservations(user);
  const isAdmin = user.role === "ADMIN";

  return (
    <section className="bg-card rounded-2xl border p-4 shadow-xs">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <CalendarClock className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Upcoming bookings
            </h2>
            <p className="text-muted-foreground text-[11px]">
              {isAdmin ? "Across all team members" : "Your confirmed bookings"}
            </p>
          </div>
        </div>
        <Link
          href={isAdmin ? "/reservations" : "/reservations/mine"}
          aria-label="View all reservations"
          className="inline-flex size-8 items-center justify-center rounded-lg text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <DashboardReservationColumn
        title="Next"
        count={upcomingReservations.length}
        emptyText="No upcoming bookings."
        items={upcomingReservations}
        formatTime={(res) =>
          formatInTimeZone(res.startTime, tz, "MMM d, HH:mm")
        }
        isAdmin={isAdmin}
      />
    </section>
  );
}
