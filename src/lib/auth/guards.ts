import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/errors";
import type { CurrentUser } from "@/lib/services/user.service";

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function assertAdmin(user: CurrentUser): void {
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Admin access required");
  }
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  assertAdmin(user);
  return user;
}
