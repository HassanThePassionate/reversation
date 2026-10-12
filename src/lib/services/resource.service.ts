import { cache } from "react";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";
import type { ResourceFilterInput } from "@/lib/validation/resource";

export {
  createResource,
  updateResource,
  setResourceActive,
  deleteResource,
} from "@/lib/services/resource-mutation.service";

export async function listResources(filters: ResourceFilterInput) {
  const where: Prisma.ResourceWhereInput = {};
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.typeId) where.typeId = filters.typeId;
  if (filters.status === "ACTIVE") where.isActive = true;
  if (filters.status === "INACTIVE") where.isActive = false;

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        openTime: true,
        closeTime: true,
        isActive: true,
        type: { select: { id: true, name: true } },
        _count: {
          select: {
            reservations: {
              where: { status: "CONFIRMED", endTime: { gt: new Date() } },
            },
          },
        },
      },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export async function getResourceById(id: string) {
  const res = await prisma.resource.findUnique({
    where: { id },
    include: {
      type: true,
      _count: {
        select: {
          reservations: {
            where: { status: "CONFIRMED", endTime: { gt: new Date() } },
          },
        },
      },
    },
  });
  if (!res) throw new NotFoundError("Resource not found");
  return res;
}

export const listResourceTypes = cache(async () =>
  prisma.resourceType.findMany({ orderBy: { name: "asc" } })
);
