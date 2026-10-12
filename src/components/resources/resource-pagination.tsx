import { Pagination } from "@/components/ui/pagination";

interface ResourcePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  searchParams: {
    search?: string;
    typeId?: string;
    status?: string;
  };
}

export function ResourcePagination({
  page,
  totalPages,
  total,
  searchParams,
}: ResourcePaginationProps) {
  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.typeId) params.set("typeId", searchParams.typeId);
    if (searchParams.status && searchParams.status !== "ALL") {
      params.set("status", searchParams.status);
    }
    params.set("page", String(targetPage));
    return `/resources?${params.toString()}`;
  }

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      total={total}
      itemName="resources"
      buildPageUrl={buildPageUrl}
    />
  );
}
