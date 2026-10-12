import { DURATION_OPTIONS } from "@/lib/constants";

interface AvailabilityTimeFieldsProps {
  date: string;
  startTime: string;
  duration: number;
}

const inputClass =
  "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export function AvailabilityTimeFields({
  date,
  startTime,
  duration,
}: AvailabilityTimeFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="avail-date" className="block text-xs font-medium">
          Date
        </label>
        <input
          id="avail-date"
          type="date"
          name="date"
          required
          defaultValue={date}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="avail-time" className="block text-xs font-medium">
          Start Time
        </label>
        <input
          id="avail-time"
          type="time"
          name="startTime"
          step="900"
          required
          defaultValue={startTime}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="avail-dur" className="block text-xs font-medium">
          Duration
        </label>
        <select
          id="avail-dur"
          name="duration"
          defaultValue={duration}
          className={inputClass}
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
