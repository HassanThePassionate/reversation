import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildReservationWhere,
  reservationSelectFields,
  sanitizeReservations,
} from "@/lib/services/reservation-query";
import type { CurrentUser } from "@/lib/services/user.service";
import type { ReservationFilterInput } from "@/lib/validation/reservation";

export async function listReservations(
  filters: ReservationFilterInput,
  viewer: CurrentUser
) {
  const where = buildReservationWhere(filters, viewer);
  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      select: reservationSelectFields,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      orderBy: { startTime: "asc" },
    }),
    prisma.reservation.count({ where }),
  ]);

  return {
    items: sanitizeReservations(items, viewer),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(total / filters.pageSize),
  };
}

export async function getMyReservations(viewer: CurrentUser) {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        userId: viewer.id,
        status: ReservationStatus.CONFIRMED,
        endTime: { gte: now },
      },
      select: reservationSelectFields,
      orderBy: { startTime: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        userId: viewer.id,
        OR: [{ status: ReservationStatus.CANCELLED }, { endTime: { lt: now } }],
      },
      select: reservationSelectFields,
      orderBy: { startTime: "desc" },
    }),
  ]);

  return { upcoming, past };
}

export async function getReservationFilterOptions(viewer: CurrentUser) {
  const [resources, users] = await Promise.all([
    prisma.resource.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    viewer.role === "ADMIN"
      ? prisma.user.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return { resources, users };
}
