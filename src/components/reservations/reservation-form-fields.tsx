import { FieldError } from "@/components/ui/field-error";
import { ReservationTimeFields } from "@/components/reservations/reservation-time-fields";

interface ReservationFormFieldsProps {
  defaultValues?: {
    title?: string;
    startTime?: string;
    endTime?: string;
    notes?: string | null;
  };
  fieldErrors?: Record<string, string[] | undefined>;
  disabled?: boolean;
}

const inputClass =
  "bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50";

export function ReservationFormFields({
  defaultValues,
  fieldErrors,
  disabled,
}: ReservationFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-xs font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          disabled={disabled}
          defaultValue={defaultValues?.title ?? ""}
          placeholder="e.g. Weekly Strategy Sync"
          className={inputClass}
        />
        <FieldError message={fieldErrors?.title?.[0]} />
      </div>

      <ReservationTimeFields
        startTime={defaultValues?.startTime}
        endTime={defaultValues?.endTime}
        fieldErrors={fieldErrors}
        disabled={disabled}
      />

      <div>
        <label htmlFor="notes" className="block text-xs font-medium">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          disabled={disabled}
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Meeting agenda, equipment needed, etc."
          className="bg-background focus-visible:ring-ring mt-1 w-full rounded-md border p-2 text-xs focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        />
      </div>
    </div>
  );
}
