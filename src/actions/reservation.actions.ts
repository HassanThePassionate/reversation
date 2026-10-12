"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { AppError, isRedirectError, type ActionResult } from "@/lib/errors";
import {
  cancelReservation,
  createReservation,
  rescheduleReservation,
} from "@/lib/services/reservation.service";
import {
  createReservationSchema,
  rescheduleReservationSchema,
} from "@/lib/validation/reservation";

export async function createReservationAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let resourceId = "";
  try {
    const user = await requireUser();
    resourceId = String(formData.get("resourceId") ?? "");
    const raw = {
      resourceId,
      title: formData.get("title"),
      notes: formData.get("notes") || null,
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
    };

    const parsed = createReservationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await createReservation(parsed.data, user);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("Create reservation error:", error);
    return { success: false, error: "Failed to create reservation." };
  }

  revalidatePath(`/resources/${resourceId}`);
  revalidatePath("/resources");
  revalidatePath("/reservations");
  revalidatePath("/reservations/mine");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function rescheduleReservationAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  let resResourceId = "";
  try {
    const user = await requireUser();
    const raw = {
      title: formData.get("title") ? String(formData.get("title")) : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : null,
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
    };

    const parsed = rescheduleReservationSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the form errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const updated = await rescheduleReservation(id, parsed.data, user);
    resResourceId = updated.resourceId;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("Reschedule reservation error:", error);
    return { success: false, error: "Failed to reschedule reservation." };
  }

  revalidatePath(`/resources/${resResourceId}`);
  revalidatePath("/reservations");
  revalidatePath("/reservations/mine");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function cancelReservationAction(
  id: string
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const res = await cancelReservation(id, user);
    revalidatePath(`/resources/${res.resourceId}`);
    revalidatePath("/reservations");
    revalidatePath("/reservations/mine");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AppError)
      return { success: false, error: error.message };
    console.error("Cancel reservation error:", error);
    return { success: false, error: "Failed to cancel reservation." };
  }
}
