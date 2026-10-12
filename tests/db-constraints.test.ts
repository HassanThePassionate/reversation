import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { ReservationStatus } from "@prisma/client";

describe("Database constraints on reservations", () => {
  const resourceId = `test-res-${Date.now()}`;
  const userId = `test-user-${Date.now()}`;
  const typeId = `test-type-${Date.now()}`;

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: { id: typeId, name: `Type-${Date.now()}` },
    });
    await prisma.resource.create({
      data: {
        id: resourceId,
        name: "Test Room",
        typeId,
        openTime: "08:00",
        closeTime: "20:00",
      },
    });
    await prisma.user.create({
      data: {
        id: userId,
        name: "Test Tester",
        email: `tester-${Date.now()}@example.com`,
        passwordHash: "dummyhash",
      },
    });
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({ where: { resourceId } });
    await prisma.resource.deleteMany({ where: { id: resourceId } });
    await prisma.resourceType.deleteMany({ where: { id: typeId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("rejects overlapping CONFIRMED reservation at the database level", async () => {
    const start = new Date("2026-10-15T10:00:00.000Z");
    const end = new Date("2026-10-15T11:00:00.000Z");

    await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        title: "Initial Booking",
        startTime: start,
        endTime: end,
        status: ReservationStatus.CONFIRMED,
      },
    });

    const overlapStart = new Date("2026-10-15T10:30:00.000Z");
    const overlapEnd = new Date("2026-10-15T11:30:00.000Z");

    await expect(
      prisma.reservation.create({
        data: {
          resourceId,
          userId,
          title: "Conflicting Booking",
          startTime: overlapStart,
          endTime: overlapEnd,
          status: ReservationStatus.CONFIRMED,
        },
      })
    ).rejects.toThrow();
  });

  it("allows back-to-back reservations where endTime equals next startTime", async () => {
    const start1 = new Date("2026-10-15T11:00:00.000Z");
    const end1 = new Date("2026-10-15T12:00:00.000Z");
    const end2 = new Date("2026-10-15T13:00:00.000Z");

    const res1 = await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        title: "Slot 1",
        startTime: start1,
        endTime: end1,
        status: ReservationStatus.CONFIRMED,
      },
    });

    const res2 = await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        title: "Slot 2 (Back-to-back)",
        startTime: end1,
        endTime: end2,
        status: ReservationStatus.CONFIRMED,
      },
    });

    expect(res1.id).toBeDefined();
    expect(res2.id).toBeDefined();
  });

  it("does not block a new CONFIRMED booking when previous booking is CANCELLED", async () => {
    const start = new Date("2026-10-15T14:00:00.000Z");
    const end = new Date("2026-10-15T15:00:00.000Z");

    await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        title: "Cancelled Slot",
        startTime: start,
        endTime: end,
        status: ReservationStatus.CANCELLED,
      },
    });

    const activeRes = await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        title: "Active Booking over Cancelled",
        startTime: start,
        endTime: end,
        status: ReservationStatus.CONFIRMED,
      },
    });

    expect(activeRes.id).toBeDefined();
    expect(activeRes.status).toBe(ReservationStatus.CONFIRMED);
  });

  it("rejects reservation when endTime <= startTime via CHECK constraint", async () => {
    const start = new Date("2026-10-15T16:00:00.000Z");
    const invalidEnd = new Date("2026-10-15T15:00:00.000Z");

    await expect(
      prisma.reservation.create({
        data: {
          resourceId,
          userId,
          title: "Invalid Range Booking",
          startTime: start,
          endTime: invalidEnd,
          status: ReservationStatus.CONFIRMED,
        },
      })
    ).rejects.toThrow();
  });
});
