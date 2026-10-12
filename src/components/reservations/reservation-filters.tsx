import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservationDateFilters } from "@/components/reservations/reservation-date-filters";
import type { ReservationFiltersProps } from "@/components/reservations/reservation-filter-types";
import { ReservationSelectFilters } from "@/components/reservations/reservation-select-filters";

export type { ResourceOption, UserOption, ReservationFiltersProps } from "@/components/reservations/reservation-filter-types";

const inputClass =
  "border-slate-200 bg-white text-slate-800 mt-1 h-9 w-full rounded-xl border px-2.5 text-xs focus-visible:ring-blue-500 focus-visible:ring-2 focus-visible:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200";

export function ReservationFilters({
  resources,
  users = [],
  isAdmin,
  searchParams,
}: ReservationFiltersProps) {
  return (
    <form
      method="get"
      action="/reservations"
      className="bg-card grid grid-cols-1 gap-3 rounded-2xl border p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-5"
    >
      <ReservationSelectFilters
        resources={resources}
        resourceId={searchParams.resourceId}
        status={searchParams.status}
      />

      <ReservationDateFilters
        startDate={searchParams.startDate}
        endDate={searchParams.endDate}
      />

      {isAdmin && users.length > 0 && (
        <div>
          <label htmlFor="filter-user" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            User
          </label>
          <select id="filter-user" name="userId" defaultValue={searchParams.userId ?? ""} className={inputClass}>
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-end gap-2 lg:col-span-1">
        <Button type="submit" size="sm" className="h-9 gap-1.5 rounded-xl bg-blue-600 px-3.5 text-white hover:bg-blue-700 shadow-xs">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
        </Button>
        <Link
          href="/reservations"
          className="hover:bg-slate-100 text-slate-500 inline-flex h-9 items-center gap-1 rounded-xl border px-2.5 text-xs font-medium transition dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Link>
      </div>
    </form>
  );
}
