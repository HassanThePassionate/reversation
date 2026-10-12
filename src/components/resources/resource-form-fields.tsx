import { ResourceCoreFields } from "@/components/resources/resource-core-fields";
import { ResourceMetaFields } from "@/components/resources/resource-meta-fields";
import { ResourceOperatingHours } from "@/components/resources/resource-operating-hours";

interface ResourceFormFieldsProps {
  types: Array<{ id: string; name: string }>;
  initialData?: {
    name?: string;
    typeId?: string;
    location?: string | null;
    capacity?: number | null;
    openTime?: string;
    closeTime?: string;
    description?: string | null;
    isActive?: boolean;
  };
  isPending: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
}

export function ResourceFormFields({
  types,
  initialData,
  isPending,
  fieldErrors,
}: ResourceFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResourceCoreFields
          types={types}
          initialData={initialData}
          isPending={isPending}
          fieldErrors={fieldErrors}
        />
        <ResourceOperatingHours
          openTime={initialData?.openTime}
          closeTime={initialData?.closeTime}
          isPending={isPending}
          fieldErrors={fieldErrors}
        />
      </div>

      <ResourceMetaFields
        initialData={initialData}
        isPending={isPending}
        fieldErrors={fieldErrors}
      />
    </div>
  );
}
