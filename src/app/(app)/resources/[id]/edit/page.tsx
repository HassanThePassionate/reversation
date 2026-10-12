import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getResourceById,
  listResourceTypes,
} from "@/lib/services/resource.service";
import { NotFoundError } from "@/lib/errors";
import { ResourceForm } from "@/components/resources/resource-form";

export const metadata: Metadata = {
  title: "Edit Resource",
};

interface EditResourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResourcePage({
  params,
}: EditResourcePageProps) {
  await requireAdmin();
  const { id } = await params;

  let resource;
  let types;

  try {
    [resource, types] = await Promise.all([
      getResourceById(id),
      listResourceTypes(),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Resource</h1>
        <p className="text-muted-foreground text-xs">
          Update details and configuration for {resource.name}
        </p>
      </div>

      <ResourceForm types={types} initialData={resource} />
    </div>
  );
}
