import { FormField } from "@/components/resources/form-field";

interface ResourceCoreFieldsProps {
  types: Array<{ id: string; name: string }>;
  initialData?: {
    name?: string;
    typeId?: string;
  };
  isPending: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
}

const inputClass =
  "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none flex h-8 w-full rounded-lg border px-3 text-xs disabled:opacity-50";

export function ResourceCoreFields({
  types,
  initialData,
  isPending,
  fieldErrors,
}: ResourceCoreFieldsProps) {
  return (
    <>
      <FormField
        label="Resource Name"
        id="name"
        required
        error={fieldErrors?.name?.[0]}
      >
        <input
          id="name"
          name="name"
          defaultValue={initialData?.name ?? ""}
          required
          disabled={isPending}
          placeholder="e.g. Boardroom"
          className={inputClass}
        />
      </FormField>

      <FormField
        label="Resource Type"
        id="typeId"
        required
        error={fieldErrors?.typeId?.[0]}
      >
        <select
          id="typeId"
          name="typeId"
          defaultValue={initialData?.typeId ?? ""}
          required
          disabled={isPending}
          className={inputClass}
        >
          <option value="">Select type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
