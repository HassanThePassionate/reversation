import { formatInTimeZone } from "date-fns-tz";
import { ReservationStatus, type Prisma } from "@prisma/client";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { ConflictError } from "@/lib/errors";
import type { CurrentUser } from "@/lib/services/user.service";
import type { ReservationFilterInput } from "@/lib/validation/reservation";

export const reservationSelectFields = {
  id: true,
  resourceId: true,
  userId: true,
  title: true,
  notes: true,
  startTime: true,
  endTime: true,
  status: true,
  cancelledAt: true,
  createdAt: true,
  resource: { select: { id: true, name: true, location: true } },
  user: { select: { id: true, name: true, email: true } },
} as const;

export type SelectedReservation = Prisma.ReservationGetPayload<{
  select: typeof reservationSelectFields;
}>;

export async function checkReservationOverlap(
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: string
): Promise<void> {
  const conflict = await prisma.reservation.findFirst({
    where: {
      resourceId,
      status: ReservationStatus.CONFIRMED,
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { id: true, startTime: true, endTime: true },
    orderBy: { startTime: "asc" },
  });

  if (conflict) {
    const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
    const startStr = formatInTimeZone(
      conflict.startTime,
      tz,
      "yyyy-MM-dd HH:mm"
    );
    const endStr = formatInTimeZone(conflict.endTime, tz, "HH:mm");
    throw new ConflictError(
      `Slot conflicts with existing reservation (${startStr} - ${endStr})`
    );
  }
}

export function buildReservationWhere(
  filters: ReservationFilterInput,
  viewer: CurrentUser
): Prisma.ReservationWhereInput {
  const where: Prisma.ReservationWhereInput = {};

  if (viewer.role === "ADMIN") {
    if (filters.resourceId) where.resourceId = filters.resourceId;
    if (filters.userId) where.userId = filters.userId;
  } else if (filters.resourceId) {
    where.resourceId = filters.resourceId;
    if (filters.userId) where.userId = filters.userId;
  } else {
    where.userId = viewer.id;
  }

  if (filters.status !== "ALL") where.status = filters.status;

  if (filters.startDate || filters.endDate) {
    where.startTime = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }

  return where;
}

export function sanitizeReservations(
  items: SelectedReservation[],
  viewer: CurrentUser
): SelectedReservation[] {
  if (viewer.role === "ADMIN") return items;
  return items.map((item) =>
    item.userId === viewer.id
      ? item
      : {
          ...item,
          notes: null,
          user: { id: item.user.id, name: item.user.name, email: "" },
        }
  );
}
