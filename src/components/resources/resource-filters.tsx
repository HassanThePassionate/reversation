import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResourceFiltersProps } from "@/components/resources/resource-filter-types";

export type { ResourceTypeOption, ResourceFiltersProps } from "@/components/resources/resource-filter-types";

const fieldClass =
  "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:outline-none flex h-9 w-full rounded-xl border px-3 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200";

export function ResourceFilters({
  types,
  currentSearch,
  currentTypeId,
  currentStatus = "ALL",
}: ResourceFiltersProps) {
  const hasActiveFilters = Boolean(
    currentSearch || currentTypeId || currentStatus !== "ALL"
  );

  return (
    <form
      method="GET"
      action="/resources"
      className="bg-card flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-xs"
    >
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          name="search"
          defaultValue={currentSearch ?? ""}
          aria-label="Search resources by name or location"
          placeholder="Search rooms by name or location..."
          className={`${fieldClass} pl-9`}
        />
      </div>

      <div className="w-full sm:w-44">
        <select name="typeId" defaultValue={currentTypeId ?? ""} className={fieldClass}>
          <option value="">All Room Types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-36">
        <select name="status" defaultValue={currentStatus} className={fieldClass}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" className="h-9 gap-1.5 rounded-xl bg-blue-600 px-3.5 text-white hover:bg-blue-700 shadow-xs">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
        {hasActiveFilters && (
          <Link
            href="/resources"
            className="hover:bg-slate-100 text-slate-500 inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs font-medium transition dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Link>
        )}
      </div>
    </form>
  );
}
