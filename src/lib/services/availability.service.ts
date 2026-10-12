import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ReservationStatus } from "@prisma/client";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { NotFoundError } from "@/lib/errors";
import { buildTimelineSegments } from "@/lib/services/timeline-segments";

export {
  findAvailableResources,
  type FindAvailableResourcesParams,
} from "@/lib/services/availability-finder.service";
export {
  getUtilization,
  type ResourceUtilization,
} from "@/lib/services/utilization.service";

export interface ResourceAvailabilityNow {
  resourceId: string;
  inUse: boolean;
  isAvailableNow: boolean;
  availableAt: Date;
  currentReservation: {
    id: string;
    title: string;
    endTime: Date;
  } | null;
}

export async function getResourceDayTimeline(
  resourceId: string,
  date: Date | string
) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      name: true,
      openTime: true,
      closeTime: true,
      isActive: true,
    },
  });
  if (!resource) throw new NotFoundError("Resource not found");

  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const dateStr =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : formatInTimeZone(
          date instanceof Date ? date : new Date(date),
          tz,
          "yyyy-MM-dd"
        );

  const dayOpen = fromZonedTime(`${dateStr}T${resource.openTime}:00`, tz);
  const dayClose = fromZonedTime(`${dateStr}T${resource.closeTime}:00`, tz);

  const reservations = await prisma.reservation.findMany({
    where: {
      resourceId,
      status: ReservationStatus.CONFIRMED,
      startTime: { lt: dayClose },
      endTime: { gt: dayOpen },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      user: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  const segments = buildTimelineSegments({
    dayOpen,
    dayClose,
    reservations: reservations.map((r) => ({
      id: r.id,
      title: r.title,
      bookerName: r.user.name,
      startTime: r.startTime,
      endTime: r.endTime,
    })),
  });

  return { resource, date: dateStr, dayOpen, dayClose, segments };
}

export async function getResourcesAvailabilityNow(
  resourceIds: string[]
): Promise<Record<string, ResourceAvailabilityNow>> {
  if (resourceIds.length === 0) return {};
  const now = new Date();
  const activeBookings = await prisma.reservation.findMany({
    where: {
      resourceId: { in: resourceIds },
      status: ReservationStatus.CONFIRMED,
      startTime: { lte: now },
      endTime: { gt: now },
    },
    select: { id: true, title: true, resourceId: true, endTime: true },
  });

  const bookingMap = new Map(activeBookings.map((b) => [b.resourceId, b]));
  const result: Record<string, ResourceAvailabilityNow> = {};

  for (const id of resourceIds) {
    const current = bookingMap.get(id);
    result[id] = {
      resourceId: id,
      inUse: Boolean(current),
      isAvailableNow: !current,
      availableAt: current ? current.endTime : now,
      currentReservation: current
        ? { id: current.id, title: current.title, endTime: current.endTime }
        : null,
    };
  }
  return result;
}
