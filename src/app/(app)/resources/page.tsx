import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";
import {
  listResources,
  listResourceTypes,
} from "@/lib/services/resource.service";
import { resourceFilterSchema } from "@/lib/validation/resource";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { ResourcePageHeader } from "@/components/resources/resource-page-header";
import { ResourcePagination } from "@/components/resources/resource-pagination";
import { ResourceEmptyState } from "@/components/resources/resource-empty-state";

export const metadata: Metadata = {
  title: "Resources",
};

interface ResourcesPageProps {
  searchParams: Promise<{
    search?: string;
    typeId?: string;
    status?: "ALL" | "ACTIVE" | "INACTIVE";
    page?: string;
  }>;
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const [user, raw, types] = await Promise.all([
    requireUser(),
    searchParams,
    listResourceTypes(),
  ]);

  const filters = resourceFilterSchema.parse({
    search: raw.search,
    typeId: raw.typeId,
    status: raw.status ?? "ALL",
    page: raw.page ? Number(raw.page) : 1,
  });

  const { items, total, page, totalPages } = await listResources(filters);
  const isAdmin = user.role === "ADMIN";
  const hasFilters = Boolean(
    filters.search || filters.typeId || filters.status !== "ALL"
  );

  return (
    <div className="space-y-6">
      <ResourcePageHeader isAdmin={isAdmin} />

      <ResourceFilters
        types={types}
        currentSearch={filters.search}
        currentTypeId={filters.typeId}
        currentStatus={filters.status}
      />

      {items.length === 0 ? (
        <ResourceEmptyState isAdmin={isAdmin} hasFilters={hasFilters} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <ResourcePagination
          page={page}
          totalPages={totalPages}
          total={total}
          searchParams={{
            search: filters.search,
            typeId: filters.typeId,
            status: filters.status,
          }}
        />
      )}
    </div>
  );
}
