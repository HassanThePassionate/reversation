import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { listResourceTypes } from "@/lib/services/resource.service";
import { ResourceForm } from "@/components/resources/resource-form";

export const metadata: Metadata = {
  title: "New Resource",
};

export default async function NewResourcePage() {
  await requireAdmin();
  const types = await listResourceTypes();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Resource</h1>
        <p className="text-muted-foreground text-xs">
          Add a new room, vehicle, or equipment to the system
        </p>
      </div>

      <ResourceForm types={types} />
    </div>
  );
}
