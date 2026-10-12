import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import { getMyReservations } from "@/lib/services/reservation.service";
import { ReservationEmptyState } from "@/components/reservations/reservation-empty-state";
import { ReservationRow } from "@/components/reservations/reservation-row";

export const metadata: Metadata = {
  title: "My Reservations",
};

export default async function MyReservationsPage() {
  const user = await requireUser();
  const { upcoming, past } = await getMyReservations(user);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Manage your upcoming bookings and review your past reservation
          history.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-base font-semibold">Upcoming Bookings</h2>
          <span className="text-muted-foreground text-xs">
            {upcoming.length} active
          </span>
        </div>
        {upcoming.length === 0 ? (
          <ReservationEmptyState
            title="No upcoming reservations"
            description="You don't have any upcoming bookings scheduled."
            actionHref="/resources"
            actionLabel="Find a Resource to Book"
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((res) => (
              <ReservationRow
                key={res.id}
                reservation={{ ...res, isCompleted: false }}
                viewerId={user.id}
                isAdmin={user.role === "ADMIN"}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-base font-semibold">Past & Cancelled History</h2>
          <span className="text-muted-foreground text-xs">
            {past.length} past
          </span>
        </div>
        {past.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-xs">
            No past reservations recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((res) => (
              <ReservationRow
                key={res.id}
                reservation={{ ...res, isCompleted: true }}
                viewerId={user.id}
                isAdmin={user.role === "ADMIN"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
