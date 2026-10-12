import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import {
  getReservationFilterOptions,
  listReservations,
} from "@/lib/services/reservation.service";
import { parseReservationFilters } from "@/lib/validation/reservation";
import { ReservationEmptyState } from "@/components/reservations/reservation-empty-state";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationListHeader } from "@/components/reservations/reservation-list-header";
import { ReservationPagination } from "@/components/reservations/reservation-pagination";
import { ReservationRow } from "@/components/reservations/reservation-row";

export const metadata: Metadata = {
  title: "Reservations",
};

interface ReservationsPageProps {
  searchParams: Promise<{
    resourceId?: string;
    userId?: string;
    status?: "ALL" | "CONFIRMED" | "CANCELLED";
    startDate?: string;
    endDate?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function ReservationsPage({
  searchParams,
}: ReservationsPageProps) {
  const [user, rawParams] = await Promise.all([requireUser(), searchParams]);
  const filters = parseReservationFilters(rawParams);

  const [result, { resources, users }] = await Promise.all([
    listReservations(filters, user),
    getReservationFilterOptions(user),
  ]);

  const now = new Date();

  return (
    <div className="space-y-6">
      <ReservationListHeader />

      <ReservationFilters
        resources={resources}
        users={users}
        isAdmin={user.role === "ADMIN"}
        searchParams={rawParams}
      />

      {result.items.length === 0 ? (
        <ReservationEmptyState />
      ) : (
        <div className="space-y-3">
          {result.items.map((item) => (
            <ReservationRow
              key={item.id}
              reservation={{
                ...item,
                isCompleted: new Date(item.endTime).getTime() <= now.getTime(),
              }}
              viewerId={user.id}
              isAdmin={user.role === "ADMIN"}
            />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <ReservationPagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          searchParams={rawParams}
        />
      )}
    </div>
  );
}
