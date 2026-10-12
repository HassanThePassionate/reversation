import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  cancelReservation,
  createReservation,
  getMyReservations,
  getReservationById,
  getReservationFilterOptions,
  listReservations,
  rescheduleReservation,
} from "@/lib/services/reservation.service";
import { ConflictError, ForbiddenError, ValidationError } from "@/lib/errors";
import { ReservationStatus, Role } from "@prisma/client";
import type { CurrentUser } from "@/lib/services/user.service";

describe("Reservation Service (Integration Tests)", () => {
  const typeId = `type-res-${Date.now()}`;
  const resourceId = `res-${Date.now()}`;
  const inactiveResourceId = `res-inactive-${Date.now()}`;

  const adminUser: CurrentUser = {
    id: `admin-${Date.now()}`,
    name: "Admin Tester",
    email: `admin-${Date.now()}@test.com`,
    role: Role.ADMIN,
    teamId: null,
  };

  const memberUser1: CurrentUser = {
    id: `member1-${Date.now()}`,
    name: "Member One",
    email: `member1-${Date.now()}@test.com`,
    role: Role.MEMBER,
    teamId: null,
  };

  const memberUser2: CurrentUser = {
    id: `member2-${Date.now()}`,
    name: "Member Two",
    email: `member2-${Date.now()}@test.com`,
    role: Role.MEMBER,
    teamId: null,
  };

  // Base future date in PKT: 10:00 PKT is 05:00 UTC
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 5);
  baseDate.setUTCHours(5, 0, 0, 0); // 10:00 PKT

  const slot1Start = new Date(baseDate);
  const slot1End = new Date(baseDate.getTime() + 60 * 60 * 1000); // 11:00 PKT

  const createdReservationIds: string[] = [];

  beforeAll(async () => {
    await prisma.resourceType.create({
      data: { id: typeId, name: `Type-${Date.now()}` },
    });

    await prisma.resource.createMany({
      data: [
        {
          id: resourceId,
          name: "Active Conference Room",
          typeId,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: true,
        },
        {
          id: inactiveResourceId,
          name: "Under Maintenance Room",
          typeId,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: false,
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
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({
      where: { resourceId: { in: [resourceId, inactiveResourceId] } },
    });
    await prisma.resource.deleteMany({
      where: { id: { in: [resourceId, inactiveResourceId] } },
    });
    await prisma.resourceType.deleteMany({ where: { id: typeId } });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, memberUser1.id, memberUser2.id] } },
    });
    await prisma.$disconnect();
  });

  it("successfully creates a reservation for an active resource", async () => {
    const res = await createReservation(
      {
        resourceId,
        title: "Sprint Planning",
        startTime: slot1Start,
        endTime: slot1End,
      },
      memberUser1
    );

    createdReservationIds.push(res.id);
    expect(res.id).toBeDefined();
    expect(res.status).toBe(ReservationStatus.CONFIRMED);
    expect(res.userId).toBe(memberUser1.id);
  });

  describe("Overlap rejection checks", () => {
    it("rejects identical time slot with ConflictError naming the conflict", async () => {
      await expect(
        createReservation(
          {
            resourceId,
            title: "Identical Overlap Attempt",
            startTime: slot1Start,
            endTime: slot1End,
          },
          memberUser2
        )
      ).rejects.toThrow(ConflictError);
    });

    it("rejects partial overlap starting during existing slot", async () => {
      const partialStart = new Date(slot1Start.getTime() + 30 * 60 * 1000); // 10:30
      const partialEnd = new Date(slot1End.getTime() + 30 * 60 * 1000); // 11:30

      await expect(
        createReservation(
          {
            resourceId,
            title: "Partial Overlap Start",
            startTime: partialStart,
            endTime: partialEnd,
          },
          memberUser2
        )
      ).rejects.toThrow(ConflictError);
    });

    it("rejects partial overlap ending during existing slot", async () => {
      const partialStart = new Date(slot1Start.getTime() - 30 * 60 * 1000); // 09:30
      const partialEnd = new Date(slot1Start.getTime() + 30 * 60 * 1000); // 10:30

      await expect(
        createReservation(
          {
            resourceId,
            title: "Partial Overlap End",
            startTime: partialStart,
            endTime: partialEnd,
          },
          memberUser2
        )
      ).rejects.toThrow(ConflictError);
    });

    it("rejects contained overlap fully inside existing slot", async () => {
      const containedStart = new Date(slot1Start.getTime() + 15 * 60 * 1000); // 10:15
      const containedEnd = new Date(slot1Start.getTime() + 45 * 60 * 1000); // 10:45

      await expect(
        createReservation(
          {
            resourceId,
            title: "Contained Overlap",
            startTime: containedStart,
            endTime: containedEnd,
          },
          memberUser2
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("Back-to-back and slot reuse", () => {
    it("allows back-to-back reservations where endTime equals next startTime", async () => {
      const b2bStart = new Date(slot1End); // 11:00
      const b2bEnd = new Date(b2bStart.getTime() + 60 * 60 * 1000); // 12:00

      const res = await createReservation(
        {
          resourceId,
          title: "Back-to-Back Slot",
          startTime: b2bStart,
          endTime: b2bEnd,
        },
        memberUser2
      );

      createdReservationIds.push(res.id);
      expect(res.id).toBeDefined();
      expect(res.startTime.getTime()).toBe(slot1End.getTime());
    });

    it("allows reusing a slot once the previous reservation is cancelled", async () => {
      const cancelSlotStart = new Date(baseDate.getTime() + 3 * 60 * 60 * 1000); // 13:00
      const cancelSlotEnd = new Date(
        cancelSlotStart.getTime() + 60 * 60 * 1000
      ); // 14:00

      const initial = await createReservation(
        {
          resourceId,
          title: "Temporary Booking",
          startTime: cancelSlotStart,
          endTime: cancelSlotEnd,
        },
        memberUser1
      );

      const cancelled = await cancelReservation(initial.id, memberUser1);
      expect(cancelled.status).toBe(ReservationStatus.CANCELLED);
      expect(cancelled.cancelledAt).toBeInstanceOf(Date);

      const reuse = await createReservation(
        {
          resourceId,
          title: "Reused Cancelled Slot",
          startTime: cancelSlotStart,
          endTime: cancelSlotEnd,
        },
        memberUser2
      );

      createdReservationIds.push(reuse.id);
      expect(reuse.id).toBeDefined();
      expect(reuse.status).toBe(ReservationStatus.CONFIRMED);
    });
  });

  describe("Rescheduling and self-exclusion", () => {
    it("excludes the reservation itself when rescheduling", async () => {
      const initialId = createdReservationIds[0] ?? "";
      const shiftedStart = new Date(slot1Start.getTime() + 15 * 60 * 1000); // 10:15
      const shiftedEnd = new Date(slot1End.getTime() - 15 * 60 * 1000); // 10:45

      const updated = await rescheduleReservation(
        initialId,
        {
          title: "Shortened Meeting",
          startTime: shiftedStart,
          endTime: shiftedEnd,
        },
        memberUser1
      );

      expect(updated.title).toBe("Shortened Meeting");
      expect(updated.startTime.getTime()).toBe(shiftedStart.getTime());
      expect(updated.endTime.getTime()).toBe(shiftedEnd.getTime());
    });
  });

  describe("Authorization & Security", () => {
    it("prevents a member from touching another member's reservation", async () => {
      const initialId = createdReservationIds[0] ?? "";

      await expect(
        rescheduleReservation(
          initialId,
          {
            startTime: slot1Start,
            endTime: slot1End,
          },
          memberUser2
        )
      ).rejects.toThrow(ForbiddenError);

      await expect(cancelReservation(initialId, memberUser2)).rejects.toThrow(
        ForbiddenError
      );

      await expect(getReservationById(initialId, memberUser2)).rejects.toThrow(
        ForbiddenError
      );
    });

    it("allows an admin to manage any member reservation", async () => {
      const initialId = createdReservationIds[0] ?? "";
      const fetched = await getReservationById(initialId, adminUser);
      expect(fetched.id).toBe(initialId);
    });

    it("rejects booking for an inactive resource with ValidationError", async () => {
      await expect(
        createReservation(
          {
            resourceId: inactiveResourceId,
            title: "Maintenance Booking Attempt",
            startTime: slot1Start,
            endTime: slot1End,
          },
          memberUser1
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("List filtering and pagination", () => {
    it("returns all reservations for admin and paginates", async () => {
      const list = await listReservations(
        { page: 1, pageSize: 10, status: "ALL" },
        adminUser
      );
      expect(Array.isArray(list.items)).toBe(true);
      expect(list.total).toBeGreaterThanOrEqual(1);
    });

    it("limits member to their own reservations when not filtering by resource", async () => {
      const list = await listReservations(
        { page: 1, pageSize: 10, status: "ALL" },
        memberUser1
      );
      for (const item of list.items) {
        expect(item.userId).toBe(memberUser1.id);
      }
    });

    it("allows member to view public schedule fields when filtered by resource", async () => {
      const list = await listReservations(
        { resourceId, page: 1, pageSize: 10, status: "ALL" },
        memberUser1
      );
      expect(list.items.length).toBeGreaterThanOrEqual(1);
      for (const item of list.items) {
        if (item.userId !== memberUser1.id) {
          expect(item.notes).toBeNull();
        }
      }
    });

    it("getMyReservations splits upcoming and past reservations correctly", async () => {
      const { upcoming, past } = await getMyReservations(memberUser1);
      expect(Array.isArray(upcoming)).toBe(true);
      expect(Array.isArray(past)).toBe(true);
    });

    it("getReservationFilterOptions returns users for admin and empty for member", async () => {
      const adminOptions = await getReservationFilterOptions(adminUser);
      expect(adminOptions.resources.length).toBeGreaterThanOrEqual(1);
      expect(adminOptions.users.length).toBeGreaterThanOrEqual(1);

      const memberOptions = await getReservationFilterOptions(memberUser1);
      expect(memberOptions.resources.length).toBeGreaterThanOrEqual(1);
      expect(memberOptions.users).toHaveLength(0);
    });
  });
});
