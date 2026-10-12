import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  findAvailableResources,
  getResourceDayTimeline,
  getResourcesAvailabilityNow,
  getUtilization,
} from "@/lib/services/availability.service";
import { NotFoundError } from "@/lib/errors";
import { ReservationStatus, Role } from "@prisma/client";

describe("Availability Service (Integration Tests)", () => {
  const typeId1 = `type-avail-1-${Date.now()}`;
  const typeId2 = `type-avail-2-${Date.now()}`;
  const resId1 = `res-avail-1-${Date.now()}`;
  const resId2 = `res-avail-2-${Date.now()}`;
  const resIdInactive = `res-avail-inactive-${Date.now()}`;
  const userId = `user-avail-${Date.now()}`;

  // Use fixed future date: 2026-10-25 (PKT)
  // 10:00 PKT is 05:00 UTC
  const testDateStr = "2026-10-25";
  const slot1Start = new Date("2026-10-25T05:00:00.000Z"); // 10:00 PKT
  const slot1End = new Date("2026-10-25T07:00:00.000Z"); // 12:00 PKT

  const slot2Start = new Date("2026-10-25T09:00:00.000Z"); // 14:00 PKT
  const slot2End = new Date("2026-10-25T11:00:00.000Z"); // 16:00 PKT

  beforeAll(async () => {
    await prisma.resourceType.createMany({
      data: [
        { id: typeId1, name: `Conference-${Date.now()}` },
        { id: typeId2, name: `Lab-${Date.now()}` },
      ],
    });

    await prisma.resource.createMany({
      data: [
        {
          id: resId1,
          name: "Main Hall A",
          typeId: typeId1,
          capacity: 50,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: true,
        },
        {
          id: resId2,
          name: "Small Pod B",
          typeId: typeId2,
          capacity: 4,
          openTime: "09:00",
          closeTime: "17:00",
          isActive: true,
        },
        {
          id: resIdInactive,
          name: "Closed Room",
          typeId: typeId1,
          capacity: 20,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: false,
        },
      ],
    });

    await prisma.user.create({
      data: {
        id: userId,
        name: "Alice Booker",
        email: `alice-${Date.now()}@example.com`,
        passwordHash: "dummy",
        role: Role.MEMBER,
      },
    });

    // Create confirmed reservations on resId1
    await prisma.reservation.createMany({
      data: [
        {
          resourceId: resId1,
          userId,
          title: "Design Sprint",
          startTime: slot1Start,
          endTime: slot1End,
          status: ReservationStatus.CONFIRMED,
        },
        {
          resourceId: resId1,
          userId,
          title: "Tech Review",
          startTime: slot2Start,
          endTime: slot2End,
          status: ReservationStatus.CONFIRMED,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({
      where: { resourceId: { in: [resId1, resId2, resIdInactive] } },
    });
    await prisma.resource.deleteMany({
      where: { id: { in: [resId1, resId2, resIdInactive] } },
    });
    await prisma.resourceType.deleteMany({
      where: { id: { in: [typeId1, typeId2] } },
    });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe("getResourceDayTimeline", () => {
    it("returns ordered segments within operating hours with booker names", async () => {
      const timeline = await getResourceDayTimeline(resId1, testDateStr);

      expect(timeline.resource.id).toBe(resId1);
      expect(timeline.date).toBe(testDateStr);
      expect(Array.isArray(timeline.segments)).toBe(true);

      // Verify booked segments have booker name
      const bookedSegments = timeline.segments.filter(
        (s) => s.type === "booked"
      );
      expect(bookedSegments).toHaveLength(2);
      expect(bookedSegments[0]?.reservation?.bookerName).toBe("Alice Booker");
      expect(bookedSegments[0]?.reservation?.title).toBe("Design Sprint");

      // Verify segments are ordered and cover full operating window [08:00, 20:00]
      const firstSegment = timeline.segments[0];
      const lastSegment = timeline.segments[timeline.segments.length - 1];
      expect(firstSegment?.start).toEqual(timeline.dayOpen);
      expect(lastSegment?.end).toEqual(timeline.dayClose);
    });

    it("throws NotFoundError when resource does not exist", async () => {
      await expect(
        getResourceDayTimeline("non-existent-res", testDateStr)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getResourcesAvailabilityNow", () => {
    it("returns availability for all requested resources in a single query", async () => {
      // Create a temporary reservation that is active right now for resId2
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const inThirtyMinutes = new Date(now.getTime() + 30 * 60 * 1000);

      const activeRes = await prisma.reservation.create({
        data: {
          resourceId: resId2,
          userId,
          title: "Active Right Now",
          startTime: tenMinutesAgo,
          endTime: inThirtyMinutes,
          status: ReservationStatus.CONFIRMED,
        },
      });

      const availability = await getResourcesAvailabilityNow([resId1, resId2]);

      expect(availability[resId1]?.isAvailableNow).toBe(true);
      expect(availability[resId1]?.inUse).toBe(false);

      expect(availability[resId2]?.isAvailableNow).toBe(false);
      expect(availability[resId2]?.inUse).toBe(true);
      expect(availability[resId2]?.currentReservation?.id).toBe(activeRes.id);
      expect(availability[resId2]?.availableAt).toEqual(inThirtyMinutes);

      // Cleanup temporary reservation
      await prisma.reservation.delete({ where: { id: activeRes.id } });
    });

    it("returns empty object for empty array", async () => {
      const result = await getResourcesAvailabilityNow([]);
      expect(result).toEqual({});
    });
  });

  describe("findAvailableResources", () => {
    it("returns available resources matching time range and excludes booked ones", async () => {
      // At 10:00 on testDateStr, resId1 is booked, but resId2 is free
      const available = await findAvailableResources({
        date: testDateStr,
        startTime: "10:00",
        duration: 60,
      });

      const ids = available.map((r) => r.id);
      expect(ids).toContain(resId2);
      expect(ids).not.toContain(resId1); // Booked
      expect(ids).not.toContain(resIdInactive); // Inactive
    });

    it("respects capacity and typeId filters", async () => {
      const capacityFiltered = await findAvailableResources({
        date: testDateStr,
        startTime: "12:30",
        duration: 60,
        minCapacity: 10,
      });

      const ids = capacityFiltered.map((r) => r.id);
      // resId1 has capacity 50 and is free at 12:30
      expect(ids).toContain(resId1);
      // resId2 has capacity 4, so it should be excluded
      expect(ids).not.toContain(resId2);

      const typeFiltered = await findAvailableResources({
        date: testDateStr,
        startTime: "12:30",
        duration: 60,
        typeId: typeId2,
      });
      const typeIds = typeFiltered.map((r) => r.id);
      expect(typeIds).toContain(resId2);
      expect(typeIds).not.toContain(resId1);
    });

    it("excludes resources when requested range extends outside operating hours", async () => {
      // resId2 closes at 17:00. Request at 16:30 for 60 mins ends at 17:30 (outside closeTime)
      const available = await findAvailableResources({
        date: testDateStr,
        startTime: "16:30",
        duration: 60,
        typeId: typeId2,
      });

      expect(available.map((r) => r.id)).not.toContain(resId2);
    });
  });

  describe("getUtilization", () => {
    it("calculates booked hours per active resource via single aggregated query", async () => {
      const startRange = new Date("2026-10-25T00:00:00.000Z");
      const endRange = new Date("2026-10-25T23:59:59.000Z");

      const utilization = await getUtilization({
        startDate: startRange,
        endDate: endRange,
      });

      expect(Array.isArray(utilization)).toBe(true);

      const res1Util = utilization.find((u) => u.resourceId === resId1);
      const res2Util = utilization.find((u) => u.resourceId === resId2);

      // resId1 has two 2-hour bookings = 4.0 hours
      expect(res1Util).toBeDefined();
      expect(res1Util?.bookedHours).toBe(4);

      // resId2 has 0 bookings on that day = 0 hours
      expect(res2Util).toBeDefined();
      expect(res2Util?.bookedHours).toBe(0);
    });
  });
});
