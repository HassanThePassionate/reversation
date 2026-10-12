"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginSchema } from "@/lib/validation/auth";
import { authenticateUser } from "@/lib/services/auth.service";
import { createSession, destroySession } from "@/lib/auth/session";
import { AppError, isRedirectError, type ActionResult } from "@/lib/errors";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? "Invalid login input",
      };
    }

    const user = await authenticateUser(parsed.data);
    await createSession(user.id);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    console.error("Unexpected login error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  try {
    await destroySession();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Logout error:", error);
    throw new AppError("Failed to logout");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
