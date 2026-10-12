import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { handleDbError } from "@/lib/services/db-errors";
import { checkReservationOverlap } from "@/lib/services/reservation-query";
import { validateReservationRules } from "@/lib/services/reservation-rules";
import type { CurrentUser } from "@/lib/services/user.service";
import type { CreateReservationInput } from "@/lib/validation/reservation";

export {
  listReservations,
  getMyReservations,
  getReservationFilterOptions,
} from "@/lib/services/reservation-list.service";

export {
  rescheduleReservation,
  cancelReservation,
} from "@/lib/services/reservation-mutate.service";

export async function createReservation(
  data: CreateReservationInput,
  viewer: CurrentUser
) {
  const resource = await prisma.resource.findUnique({
    where: { id: data.resourceId },
    select: { id: true, openTime: true, closeTime: true, isActive: true },
  });
  if (!resource) throw new NotFoundError("Resource not found");
  if (!resource.isActive) {
    throw new ValidationError("Cannot book an inactive resource");
  }

  validateReservationRules({
    startTime: data.startTime,
    endTime: data.endTime,
    openTime: resource.openTime,
    closeTime: resource.closeTime,
    isActive: resource.isActive,
    timezone: env.NEXT_PUBLIC_ORG_TIMEZONE,
  });

  await checkReservationOverlap(data.resourceId, data.startTime, data.endTime);

  try {
    return await prisma.reservation.create({
      data: {
        resourceId: data.resourceId,
        userId: viewer.id,
        teamId: viewer.teamId,
        title: data.title,
        notes: data.notes,
        startTime: data.startTime,
        endTime: data.endTime,
        status: ReservationStatus.CONFIRMED,
      },
      include: {
        resource: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  } catch (error) {
    handleDbError(error);
  }
}

export async function getReservationById(id: string, viewer: CurrentUser) {
  const res = await prisma.reservation.findUnique({
    where: { id },
    include: {
      resource: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!res) throw new NotFoundError("Reservation not found");
  if (viewer.role !== "ADMIN" && res.userId !== viewer.id) {
    throw new ForbiddenError("You do not have access to this reservation");
  }
  return res;
}
