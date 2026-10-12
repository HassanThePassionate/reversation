"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createResourceAction,
  updateResourceAction,
} from "@/actions/resource.actions";
import { ResourceFormFields } from "@/components/resources/resource-form-fields";
import { Button } from "@/components/ui/button";

interface ResourceFormData {
  id?: string;
  name?: string;
  typeId?: string;
  location?: string | null;
  capacity?: number | null;
  openTime?: string;
  closeTime?: string;
  description?: string | null;
  isActive?: boolean;
}

interface ResourceFormProps {
  types: Array<{ id: string; name: string }>;
  initialData?: ResourceFormData;
}

export function ResourceForm({ types, initialData }: ResourceFormProps) {
  const boundAction = initialData?.id
    ? updateResourceAction.bind(null, initialData.id)
    : createResourceAction;
  const [state, formAction, isPending] = useActionState(boundAction, null);

  const isEdit = Boolean(initialData?.id);

  return (
    <form
      action={formAction}
      className="bg-card space-y-5 rounded-xl border p-6 shadow-xs"
    >
      {state?.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-xs">
          {state.error}
        </div>
      )}

      <ResourceFormFields
        types={types}
        initialData={initialData}
        isPending={isPending}
        fieldErrors={state?.fieldErrors}
      />

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Link
          href="/resources"
          className="text-muted-foreground hover:text-foreground text-xs font-medium transition"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEdit
              ? "Update Resource"
              : "Create Resource"}
        </Button>
      </div>
    </form>
  );
}
