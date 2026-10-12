import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/auth/guards";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type { CurrentUser } from "@/lib/services/user.service";
import type {
  CreateResourceInput,
  UpdateResourceInput,
} from "@/lib/validation/resource";

async function verifyResourceExists(id: string) {
  const count = await prisma.resource.count({ where: { id } });
  if (count === 0) throw new NotFoundError("Resource not found");
}

export async function createResource(
  data: CreateResourceInput,
  user: CurrentUser
) {
  assertAdmin(user);
  return prisma.resource.create({ data });
}

export async function updateResource(
  id: string,
  data: UpdateResourceInput,
  user: CurrentUser
) {
  assertAdmin(user);
  await verifyResourceExists(id);
  return prisma.resource.update({ where: { id }, data });
}

export async function setResourceActive(
  id: string,
  isActive: boolean,
  user: CurrentUser
) {
  assertAdmin(user);
  await verifyResourceExists(id);
  const futureConfirmedCount = !isActive
    ? await prisma.reservation.count({
        where: {
          resourceId: id,
          status: "CONFIRMED",
          endTime: { gt: new Date() },
        },
      })
    : 0;

  const resource = await prisma.resource.update({
    where: { id },
    data: { isActive },
  });
  return { resource, futureConfirmedCount };
}

export async function deleteResource(id: string, user: CurrentUser) {
  assertAdmin(user);
  await verifyResourceExists(id);
  const count = await prisma.reservation.count({ where: { resourceId: id } });
  if (count > 0) {
    throw new ConflictError(
      "Cannot delete resource with existing reservations. Deactivate it instead."
    );
  }
  return prisma.resource.delete({ where: { id } });
}
