import { FieldError } from "@/components/ui/field-error";

interface ReservationTimeFieldsProps {
  startTime?: string;
  endTime?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  disabled?: boolean;
}

const inputClass =
  "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50";

export function ReservationTimeFields({
  startTime,
  endTime,
  fieldErrors,
  disabled,
}: ReservationTimeFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="startTime" className="block text-xs font-medium">
          Start Time
        </label>
        <input
          id="startTime"
          type="datetime-local"
          name="startTime"
          required
          disabled={disabled}
          defaultValue={startTime ?? ""}
          className={inputClass}
        />
        <FieldError message={fieldErrors?.startTime?.[0]} />
      </div>
      <div>
        <label htmlFor="endTime" className="block text-xs font-medium">
          End Time
        </label>
        <input
          id="endTime"
          type="datetime-local"
          name="endTime"
          required
          disabled={disabled}
          defaultValue={endTime ?? ""}
          className={inputClass}
        />
        <FieldError message={fieldErrors?.endTime?.[0]} />
      </div>
    </div>
  );
}
