"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import {
  parseResourceFormData,
  resourceSchema,
  resourceUpdateSchema,
} from "@/lib/validation/resource";
import {
  createResource,
  setResourceActive,
  updateResource,
} from "@/lib/services/resource.service";
import { AppError, isRedirectError, type ActionResult } from "@/lib/errors";

function revalidateResource(id?: string) {
  revalidatePath("/resources");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/resources/${id}`);
}

export async function createResourceAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = resourceSchema.safeParse(parseResourceFormData(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await createResource(parsed.data, user);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AppError)
      return { success: false, error: error.message };
    return { success: false, error: "Failed to create resource" };
  }

  revalidateResource();
  redirect("/resources");
}

export async function updateResourceAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    const parsed = resourceUpdateSchema.safeParse(
      parseResourceFormData(formData)
    );
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await updateResource(id, parsed.data, user);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AppError)
      return { success: false, error: error.message };
    return { success: false, error: "Failed to update resource" };
  }

  revalidateResource(id);
  redirect("/resources");
}

export async function deactivateResourceAction(
  id: string
): Promise<ActionResult<{ futureConfirmedCount: number }>> {
  try {
    const user = await requireAdmin();
    const result = await setResourceActive(id, false, user);
    revalidateResource(id);
    return {
      success: true,
      data: { futureConfirmedCount: result.futureConfirmedCount },
    };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    return { success: false, error: "Failed to deactivate resource" };
  }
}

export async function activateResourceAction(
  id: string
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();
    await setResourceActive(id, true, user);
    revalidateResource(id);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    return { success: false, error: "Failed to activate resource" };
  }
}
