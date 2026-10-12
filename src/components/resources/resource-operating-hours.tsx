import { FormField } from "@/components/resources/form-field";

interface ResourceOperatingHoursProps {
  openTime?: string;
  closeTime?: string;
  isPending: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
}

const inputClass =
  "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none flex h-8 w-full rounded-lg border px-3 text-xs disabled:opacity-50";

export function ResourceOperatingHours({
  openTime = "08:00",
  closeTime = "20:00",
  isPending,
  fieldErrors,
}: ResourceOperatingHoursProps) {
  return (
    <>
      <FormField
        label="Opening Time"
        id="openTime"
        required
        error={fieldErrors?.openTime?.[0]}
      >
        <input
          id="openTime"
          name="openTime"
          type="time"
          defaultValue={openTime}
          required
          disabled={isPending}
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Closing Time"
        id="closeTime"
        required
        error={fieldErrors?.closeTime?.[0]}
      >
        <input
          id="closeTime"
          name="closeTime"
          type="time"
          defaultValue={closeTime}
          required
          disabled={isPending}
          className={inputClass}
        />
      </FormField>
    </>
  );
}
