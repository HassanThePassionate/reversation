import { findUserByEmail } from "@/lib/services/user.service";
import { verifyPassword } from "@/lib/auth/password";
import { UnauthorizedError } from "@/lib/errors";
import type { LoginInput } from "@/lib/validation/auth";

export async function authenticateUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValid = await verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
