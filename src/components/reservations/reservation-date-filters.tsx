interface ReservationDateFiltersProps {
  startDate?: string;
  endDate?: string;
}

export function ReservationDateFilters({
  startDate,
  endDate,
}: ReservationDateFiltersProps) {
  const inputClass =
    "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

  return (
    <>
      <div>
        <label htmlFor="filter-start" className="block text-xs font-medium">
          From Date
        </label>
        <input
          id="filter-start"
          type="date"
          name="startDate"
          defaultValue={startDate ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="filter-end" className="block text-xs font-medium">
          To Date
        </label>
        <input
          id="filter-end"
          type="date"
          name="endDate"
          defaultValue={endDate ?? ""}
          className={inputClass}
        />
      </div>
    </>
  );
}
