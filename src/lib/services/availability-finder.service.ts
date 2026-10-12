import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ReservationStatus } from "@prisma/client";
import { DEFAULT_ORG_TIMEZONE, MS_PER_MINUTE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export interface FindAvailableResourcesParams {
  date: string | Date;
  startTime: string | Date;
  duration: number;
  typeId?: string;
  minCapacity?: number;
}

export async function findAvailableResources(
  params: FindAvailableResourcesParams
) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  let requestStart: Date;
  let requestEnd: Date;

  if (params.startTime instanceof Date) {
    requestStart = params.startTime;
    requestEnd = new Date(
      requestStart.getTime() + params.duration * MS_PER_MINUTE
    );
  } else {
    const dateStr =
      typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
        ? params.date
        : formatInTimeZone(
            params.date instanceof Date ? params.date : new Date(params.date),
            tz,
            "yyyy-MM-dd"
          );
    requestStart = fromZonedTime(`${dateStr}T${params.startTime}:00`, tz);
    requestEnd = new Date(
      requestStart.getTime() + params.duration * MS_PER_MINUTE
    );
  }

  const startHHmm = formatInTimeZone(requestStart, tz, "HH:mm");
  const endHHmm = formatInTimeZone(requestEnd, tz, "HH:mm");

  return prisma.resource.findMany({
    where: {
      isActive: true,
      openTime: { lte: startHHmm },
      closeTime: { gte: endHHmm },
      ...(params.typeId ? { typeId: params.typeId } : {}),
      ...(params.minCapacity ? { capacity: { gte: params.minCapacity } } : {}),
      reservations: {
        none: {
          status: ReservationStatus.CONFIRMED,
          startTime: { lt: requestEnd },
          endTime: { gt: requestStart },
        },
      },
    },
    select: {
      id: true,
      name: true,
      location: true,
      capacity: true,
      openTime: true,
      closeTime: true,
      typeId: true,
      type: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}
