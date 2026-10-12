import { FormField } from "@/components/resources/form-field";
import { ResourceActiveToggle } from "@/components/resources/resource-active-toggle";

interface ResourceMetaFieldsProps {
  initialData?: {
    location?: string | null;
    capacity?: number | null;
    description?: string | null;
    isActive?: boolean;
  };
  isPending: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
}

const inputClass =
  "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none flex h-8 w-full rounded-lg border px-3 text-xs disabled:opacity-50";

export function ResourceMetaFields({
  initialData,
  isPending,
  fieldErrors,
}: ResourceMetaFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Location"
          id="location"
          error={fieldErrors?.location?.[0]}
        >
          <input
            id="location"
            name="location"
            defaultValue={initialData?.location ?? ""}
            disabled={isPending}
            placeholder="e.g. Floor 2, Wing A"
            className={inputClass}
          />
        </FormField>

        <FormField
          label="Capacity"
          id="capacity"
          error={fieldErrors?.capacity?.[0]}
        >
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            defaultValue={initialData?.capacity ?? ""}
            disabled={isPending}
            placeholder="e.g. 10"
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField
        label="Description"
        id="description"
        error={fieldErrors?.description?.[0]}
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialData?.description ?? ""}
          disabled={isPending}
          placeholder="Optional notes or equipment..."
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-lg border p-3 text-xs focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        />
      </FormField>

      <ResourceActiveToggle
        isActive={initialData ? initialData.isActive : true}
        isPending={isPending}
      />
    </>
  );
}
