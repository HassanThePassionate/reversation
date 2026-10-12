import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string | null;
}

export async function findUserForAuth(id: string): Promise<CurrentUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      teamId: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      teamId: true,
    },
  });
}
