import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ReservationStatus, Role } from "@prisma/client";
import { DEFAULT_ORG_TIMEZONE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  getDashboardMonthReservations,
  getDashboardReservations,
  getDashboardResourceStatus,
  getDashboardUtilization,
} from "@/lib/services/dashboard.service";
import type { CurrentUser } from "@/lib/services/user.service";

describe("Dashboard Service (Integration Tests)", () => {
  const typeId = `type-dash-${Date.now()}`;
  const resId1 = `res-dash-1-${Date.now()}`;
  const resId2 = `res-dash-2-${Date.now()}`;

  const adminUser: CurrentUser = {
    id: `admin-dash-${Date.now()}`,
    name: "Admin User",
    email: `admin-dash-${Date.now()}@test.com`,
    role: Role.ADMIN,
    teamId: null,
  };

  const memberUser1: CurrentUser = {
    id: `member1-dash-${Date.now()}`,
    name: "Member One",
    email: `member1-dash-${Date.now()}@test.com`,
    role: Role.MEMBER,
    teamId: null,
  };

  const memberUser2: CurrentUser = {
    id: `member2-dash-${Date.now()}`,
    name: "Member Two",
    email: `member2-dash-${Date.now()}@test.com`,
    role: Role.MEMBER,
    teamId: null,
  };

  const tz = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
  const todayStr = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
  const todaySlot1Start = fromZonedTime(`${todayStr}T10:00:00.000`, tz);
  const todaySlot1End = fromZonedTime(`${todayStr}T11:00:00.000`, tz);
  const todaySlot2Start = fromZonedTime(`${todayStr}T12:00:00.000`, tz);
  const todaySlot2End = fromZonedTime(`${todayStr}T13:00:00.000`, tz);
  const todayCancelledStart = fromZonedTime(`${todayStr}T14:00:00.000`, tz);
  const todayCancelledEnd = fromZonedTime(`${todayStr}T15:00:00.000`, tz);

  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 4);
  const upcomingStr = formatInTimeZone(upcomingDate, tz, "yyyy-MM-dd");
  const futureSlot1Start = fromZonedTime(`${upcomingStr}T10:00:00.000`, tz);
  const futureSlot1End = fromZonedTime(`${upcomingStr}T11:00:00.000`, tz);
  const futureSlot2Start = fromZonedTime(`${upcomingStr}T12:00:00.000`, tz);
  const futureSlot2End = fromZonedTime(`${upcomingStr}T13:00:00.000`, tz);

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: { id: typeId, name: `Type-${Date.now()}` },
    });

    await prisma.resource.createMany({
      data: [
        {
          id: resId1,
          name: "Dashboard Alpha Room",
          typeId,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: true,
        },
        {
          id: resId2,
          name: "Dashboard Beta Room",
          typeId,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: true,
        },
      ],
    });

    await prisma.user.createMany({
      data: [
        {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          passwordHash: "dummy",
          role: Role.ADMIN,
        },
        {
          id: memberUser1.id,
          name: memberUser1.name,
          email: memberUser1.email,
          passwordHash: "dummy",
          role: Role.MEMBER,
        },
        {
          id: memberUser2.id,
          name: memberUser2.name,
          email: memberUser2.email,
          passwordHash: "dummy",
          role: Role.MEMBER,
        },
      ],
    });

    await prisma.reservation.createMany({
      data: [
        {
          resourceId: resId1,
          userId: memberUser1.id,
          title: "Member 1 Today Sync",
          startTime: todaySlot1Start,
          endTime: todaySlot1End,
          status: ReservationStatus.CONFIRMED,
        },
        {
          resourceId: resId2,
          userId: memberUser2.id,
          title: "Member 2 Today Sync",
          startTime: todaySlot2Start,
          endTime: todaySlot2End,
          status: ReservationStatus.CONFIRMED,
        },
        {
          resourceId: resId1,
          userId: memberUser1.id,
          title: "Cancelled Booking",
          startTime: todayCancelledStart,
          endTime: todayCancelledEnd,
          status: ReservationStatus.CANCELLED,
        },
        {
          resourceId: resId1,
          userId: memberUser1.id,
          title: "Member 1 Next Week",
          startTime: futureSlot1Start,
          endTime: futureSlot1End,
          status: ReservationStatus.CONFIRMED,
        },
        {
          resourceId: resId2,
          userId: memberUser2.id,
          title: "Member 2 Next Week",
          startTime: futureSlot2Start,
          endTime: futureSlot2End,
          status: ReservationStatus.CONFIRMED,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({
      where: { resourceId: { in: [resId1, resId2] } },
    });
    await prisma.resource.deleteMany({
      where: { id: { in: [resId1, resId2] } },
    });
    await prisma.resourceType.deleteMany({ where: { id: typeId } });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, memberUser1.id, memberUser2.id] } },
    });
    await prisma.$disconnect();
  });

  it("filters reservations for members so they only see their own confirmed bookings", async () => {
    const { todayReservations, upcomingReservations } =
      await getDashboardReservations(memberUser1);

    expect(todayReservations.length).toBe(1);
    expect(todayReservations[0]?.title).toBe("Member 1 Today Sync");

    expect(upcomingReservations.length).toBe(1);
    expect(upcomingReservations[0]?.title).toBe("Member 1 Next Week");
  });

  it("shows all users' confirmed bookings to admins", async () => {
    const { todayReservations, upcomingReservations } =
      await getDashboardReservations(adminUser);

    const todayTitles = todayReservations.map((r) => r.title);
    expect(todayTitles).toContain("Member 1 Today Sync");
    expect(todayTitles).toContain("Member 2 Today Sync");
    expect(todayTitles).not.toContain("Cancelled Booking");

    const upcomingTitles = upcomingReservations.map((r) => r.title);
    expect(upcomingTitles).toContain("Member 1 Next Week");
    expect(upcomingTitles).toContain("Member 2 Next Week");
  });

  it("returns only confirmed reservations in the selected month and user scope", async () => {
    const month = formatInTimeZone(new Date(), tz, "yyyy-MM");
    const memberReservations = await getDashboardMonthReservations(
      memberUser1,
      month
    );
    const adminReservations = await getDashboardMonthReservations(
      adminUser,
      month
    );

    expect(
      memberReservations.map((reservation) => reservation.title)
    ).toContain("Member 1 Today Sync");
    expect(
      memberReservations.map((reservation) => reservation.title)
    ).not.toContain("Member 2 Today Sync");
    expect(adminReservations.map((reservation) => reservation.title)).toContain(
      "Member 2 Today Sync"
    );
    expect(
      adminReservations.map((reservation) => reservation.title)
    ).not.toContain("Cancelled Booking");
  });

  it("returns resource status counts using single-query availability", async () => {
    const status = await getDashboardResourceStatus();

    expect(status.totalCount).toBeGreaterThanOrEqual(2);
    expect(status.freeCount + status.inUseCount).toBe(status.totalCount);
  });

  it("returns weekly utilization array for active resources", async () => {
    const rows = await getDashboardUtilization();

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const alpha = rows.find((r) => r.resourceId === resId1);
    expect(alpha).toBeDefined();
    expect(typeof alpha?.bookedHours).toBe("number");
  });
});
