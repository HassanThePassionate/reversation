import { ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { handleDbError } from "@/lib/services/db-errors";
import { checkReservationOverlap } from "@/lib/services/reservation-query";
import { validateReservationRules } from "@/lib/services/reservation-rules";
import type { CurrentUser } from "@/lib/services/user.service";
import type { RescheduleReservationInput } from "@/lib/validation/reservation";

export async function rescheduleReservation(
  id: string,
  data: RescheduleReservationInput,
  viewer: CurrentUser
) {
  const res = await prisma.reservation.findUnique({
    where: { id },
    include: { resource: true },
  });
  if (!res) throw new NotFoundError("Reservation not found");
  if (viewer.role !== "ADMIN" && res.userId !== viewer.id) {
    throw new ForbiddenError("You are not allowed to modify this reservation");
  }
  if (res.endTime.getTime() <= Date.now()) {
    throw new ValidationError(
      "Cannot modify a reservation that has already ended"
    );
  }
  if (res.status === ReservationStatus.CANCELLED) {
    throw new ValidationError("Cannot reschedule a cancelled reservation");
  }
  if (!res.resource.isActive) {
    throw new ValidationError(
      "Cannot reschedule booking for an inactive resource"
    );
  }

  validateReservationRules({
    startTime: data.startTime,
    endTime: data.endTime,
    openTime: res.resource.openTime,
    closeTime: res.resource.closeTime,
    isActive: res.resource.isActive,
    timezone: env.NEXT_PUBLIC_ORG_TIMEZONE,
  });

  await checkReservationOverlap(
    res.resourceId,
    data.startTime,
    data.endTime,
    res.id
  );

  try {
    return await prisma.reservation.update({
      where: { id },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.title ? { title: data.title } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
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

export async function cancelReservation(id: string, viewer: CurrentUser) {
  const res = await prisma.reservation.findUnique({ where: { id } });
  if (!res) throw new NotFoundError("Reservation not found");
  if (viewer.role !== "ADMIN" && res.userId !== viewer.id) {
    throw new ForbiddenError("You are not allowed to cancel this reservation");
  }
  if (res.endTime.getTime() <= Date.now()) {
    throw new ValidationError(
      "Cannot modify a reservation that has already ended"
    );
  }
  if (res.status === ReservationStatus.CANCELLED) return res;

  return prisma.reservation.update({
    where: { id },
    data: { status: ReservationStatus.CANCELLED, cancelledAt: new Date() },
  });
}
