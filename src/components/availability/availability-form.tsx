import Link from "next/link";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvailabilityTimeFields } from "@/components/availability/availability-time-fields";

interface ResourceTypeOption {
  id: string;
  name: string;
}

interface AvailabilityFormProps {
  types: ResourceTypeOption[];
  defaultValues: {
    date: string;
    startTime: string;
    duration: number;
    typeId?: string;
    minCapacity?: number;
  };
}

const inputClass =
  "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export function AvailabilityForm({
  types,
  defaultValues,
}: AvailabilityFormProps) {
  return (
    <form
      method="get"
      action="/availability"
      className="bg-card text-card-foreground grid grid-cols-1 gap-3 rounded-xl border p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-6"
    >
      <AvailabilityTimeFields
        date={defaultValues.date}
        startTime={defaultValues.startTime}
        duration={defaultValues.duration}
      />

      <div>
        <label htmlFor="avail-type" className="block text-xs font-medium">
          Type
        </label>
        <select
          id="avail-type"
          name="typeId"
          defaultValue={defaultValues.typeId ?? ""}
          className={inputClass}
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="avail-cap" className="block text-xs font-medium">
          Min Capacity
        </label>
        <input
          id="avail-cap"
          type="number"
          name="minCapacity"
          min="1"
          placeholder="Any"
          defaultValue={defaultValues.minCapacity ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex items-end gap-2 lg:col-span-1">
        <Button type="submit" size="sm" className="h-8 gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
        </Button>
        <Link
          href="/availability"
          className="hover:bg-slate-100 text-slate-500 inline-flex h-8 items-center gap-1 rounded-xl border px-3 text-xs font-medium transition dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Link>
      </div>
    </form>
  );
}
