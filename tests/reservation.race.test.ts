import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { createReservation } from "@/lib/services/reservation.service";
import { ConflictError } from "@/lib/errors";
import { Role } from "@prisma/client";
import type { CurrentUser } from "@/lib/services/user.service";

describe("Reservation Concurrency & Race Condition Test", () => {
  const typeId = `type-race-${Date.now()}`;
  const resourceId = `res-race-${Date.now()}`;
  const userId = `user-race-${Date.now()}`;

  const memberUser: CurrentUser = {
    id: userId,
    name: "Concurrent Member",
    email: `concurrent-${Date.now()}@example.com`,
    role: Role.MEMBER,
    teamId: null,
  };

  // Base future date at 14:00 PKT (09:00 UTC)
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 7);
  baseDate.setUTCHours(9, 0, 0, 0); // 14:00 PKT

  const startTime = new Date(baseDate);
  const endTime = new Date(baseDate.getTime() + 60 * 60 * 1000); // 15:00 PKT

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: { id: typeId, name: `RaceType-${Date.now()}` },
    });
    await prisma.resource.create({
      data: {
        id: resourceId,
        name: "Race Condition Test Room",
        typeId,
        openTime: "08:00",
        closeTime: "20:00",
        isActive: true,
      },
    });
    await prisma.user.create({
      data: {
        id: userId,
        name: memberUser.name,
        email: memberUser.email,
        passwordHash: "dummy",
        role: Role.MEMBER,
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

  it("handles 10 parallel createReservation calls: exactly 1 succeeds and 9 fail with ConflictError", async () => {
    let successCount = 0;
    let conflictCount = 0;
    let otherErrorCount = 0;
    const errors: unknown[] = [];

    await Promise.all(
      Array.from({ length: 10 }).map(async (_, index) => {
        try {
          await createReservation(
            {
              resourceId,
              title: `Concurrent Attempt ${index + 1}`,
              startTime,
              endTime,
            },
            memberUser
          );
          successCount++;
        } catch (err) {
          errors.push(err);
          if (err instanceof ConflictError) {
            conflictCount++;
          } else {
            otherErrorCount++;
          }
        }
      })
    );

    // Exactly one call should acquire the slot
    expect(successCount).toBe(1);

    // The other 9 must fail with ConflictError, never raw database errors
    expect(conflictCount).toBe(9);
    expect(otherErrorCount).toBe(0);

    // Verify only 1 reservation was persisted in the DB
    const confirmedCount = await prisma.reservation.count({
      where: {
        resourceId,
        status: "CONFIRMED",
        startTime,
        endTime,
      },
    });
    expect(confirmedCount).toBe(1);
  });
});
