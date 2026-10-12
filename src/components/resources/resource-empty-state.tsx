import Link from "next/link";
import { Building2, Plus, RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface ResourceEmptyStateProps {
  isAdmin: boolean;
  hasFilters: boolean;
}

export function ResourceEmptyState({
  isAdmin,
  hasFilters,
}: ResourceEmptyStateProps) {
  return (
    <div className="bg-card flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
        <Building2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No rooms found</h3>
      <p className="text-slate-500 mt-1 max-w-sm text-xs">
        {hasFilters
          ? "No rooms match your search or filter criteria. Try clearing the filters."
          : "Get started by adding your first meeting room or resource."}
      </p>

      <div className="mt-5 flex gap-2">
        {hasFilters && (
          <Link
            href="/resources"
            className="hover:bg-slate-100 text-slate-700 inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition dark:text-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Filters</span>
          </Link>
        )}
        {isAdmin && !hasFilters && (
          <Link
            href="/resources/new"
            className={buttonVariants({
              size: "sm",
              className: "h-9 gap-1.5 rounded-xl bg-blue-600 font-medium text-white hover:bg-blue-700",
            })}
          >
            <Plus className="h-4 w-4" />
            <span>New Room</span>
          </Link>
        )}
      </div>
    </div>
  );
}
