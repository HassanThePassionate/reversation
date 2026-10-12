import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ReservationStatus } from "@prisma/client";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  getResourcesAvailabilityNow,
  getUtilization,
} from "@/lib/services/availability.service";
import type { CurrentUser } from "@/lib/services/user.service";

export async function getDashboardReservations(viewer: CurrentUser) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const now = new Date();
  const todayStr = formatInTimeZone(now, tz, "yyyy-MM-dd");
  const todayStart = fromZonedTime(`${todayStr}T00:00:00.000`, tz);
  const todayEnd = fromZonedTime(`${todayStr}T23:59:59.999`, tz);

  const baseWhere = {
    status: ReservationStatus.CONFIRMED,
    ...(viewer.role !== "ADMIN" ? { userId: viewer.id } : {}),
  };

  const [todayReservations, upcomingReservations] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        ...baseWhere,
        startTime: { lt: todayEnd },
        endTime: { gt: todayStart },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        resource: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
      take: 6,
    }),
    prisma.reservation.findMany({
      where: {
        ...baseWhere,
        startTime: { gte: todayEnd },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        resource: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ]);

  return { todayReservations, upcomingReservations };
}

export async function getDashboardMonthReservations(
  viewer: CurrentUser,
  month: string
) {
  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const monthStart = fromZonedTime(`${month}-01T00:00:00.000`, tz);
  const nextMonthDate = new Date(`${month}-01T00:00:00.000Z`);
  nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
  const nextMonthKey = formatInTimeZone(nextMonthDate, "UTC", "yyyy-MM");
  const monthEnd = fromZonedTime(`${nextMonthKey}-01T00:00:00.000`, tz);

  return prisma.reservation.findMany({
    where: {
      status: ReservationStatus.CONFIRMED,
      startTime: { gte: monthStart, lt: monthEnd },
      ...(viewer.role !== "ADMIN" ? { userId: viewer.id } : {}),
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      resource: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getDashboardResourceStatus() {
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const availabilityMap = await getResourcesAvailabilityNow(
    resources.map((r) => r.id)
  );

  const inUseCount = Object.values(availabilityMap).filter(
    (a) => a.inUse
  ).length;
  const freeCount = resources.length - inUseCount;

  return {
    totalCount: resources.length,
    freeCount,
    inUseCount,
  };
}

export async function getDashboardUtilization() {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getUtilization({ startDate: weekStart, endDate: now });
}
