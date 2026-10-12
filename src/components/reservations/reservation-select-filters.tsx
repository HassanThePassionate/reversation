interface ReservationSelectFiltersProps {
  resources: Array<{ id: string; name: string }>;
  resourceId?: string;
  status?: string;
}

const inputClass =
  "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export function ReservationSelectFilters({
  resources,
  resourceId,
  status,
}: ReservationSelectFiltersProps) {
  return (
    <>
      <div>
        <label htmlFor="filter-resource" className="block text-xs font-medium">
          Resource
        </label>
        <select
          id="filter-resource"
          name="resourceId"
          defaultValue={resourceId ?? ""}
          className={inputClass}
        >
          <option value="">All Resources</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-status" className="block text-xs font-medium">
          Status
        </label>
        <select
          id="filter-status"
          name="status"
          defaultValue={status ?? "ALL"}
          className={inputClass}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </>
  );
}
