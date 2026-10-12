import { Pagination } from "@/components/ui/pagination";

interface ReservationPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  searchParams: {
    resourceId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function ReservationPagination({
  page,
  totalPages,
  total,
  searchParams,
}: ReservationPaginationProps) {
  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (searchParams.resourceId)
      params.set("resourceId", searchParams.resourceId);
    if (searchParams.userId) params.set("userId", searchParams.userId);
    if (searchParams.status && searchParams.status !== "ALL") {
      params.set("status", searchParams.status);
    }
    if (searchParams.startDate) params.set("startDate", searchParams.startDate);
    if (searchParams.endDate) params.set("endDate", searchParams.endDate);
    params.set("page", String(targetPage));
    return `/reservations?${params.toString()}`;
  }

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      total={total}
      itemName="reservations"
      buildPageUrl={buildPageUrl}
    />
  );
}
