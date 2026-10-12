import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import {
  createResource,
  deleteResource,
  getResourceById,
  listResources,
  listResourceTypes,
  setResourceActive,
  updateResource,
} from "@/lib/services/resource.service";
import { resourceSchema } from "@/lib/validation/resource";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { ReservationStatus, Role } from "@prisma/client";
import type { CurrentUser } from "@/lib/services/user.service";

describe("Resource Service", () => {
  const adminUser: CurrentUser = {
    id: "admin-svc-test",
    name: "Admin Tester",
    email: "admin-svc@test.com",
    role: Role.ADMIN,
    teamId: null,
  };

  const memberUser: CurrentUser = {
    id: "member-svc-test",
    name: "Member Tester",
    email: "member-svc@test.com",
    role: Role.MEMBER,
    teamId: null,
  };

  let typeId = "";
  const createdResourceIds: string[] = [];

  beforeAll(async () => {
    const rType = await prisma.resourceType.create({
      data: { name: `Type-${Date.now()}` },
    });
    typeId = rType.id;
  });

  afterAll(async () => {
    if (createdResourceIds.length > 0) {
      await prisma.reservation.deleteMany({
        where: { resourceId: { in: createdResourceIds } },
      });
      await prisma.resource.deleteMany({
        where: { id: { in: createdResourceIds } },
      });
    }
    if (typeId) {
      await prisma.resourceType.delete({ where: { id: typeId } });
    }
    await prisma.$disconnect();
  });

  describe("Validation schema", () => {
    it("rejects openTime >= closeTime", () => {
      const invalid = resourceSchema.safeParse({
        name: "Test Room",
        typeId,
        openTime: "18:00",
        closeTime: "09:00",
      });
      expect(invalid.success).toBe(false);
    });

    it("rejects capacity < 1", () => {
      const invalid = resourceSchema.safeParse({
        name: "Test Room",
        typeId,
        capacity: 0,
        openTime: "09:00",
        closeTime: "18:00",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("CRUD operations and role security", () => {
    it("creates a resource as admin and forbids member", async () => {
      await expect(
        createResource(
          {
            name: "Member Attempt",
            typeId,
            openTime: "09:00",
            closeTime: "17:00",
            isActive: true,
          },
          memberUser
        )
      ).rejects.toThrow(ForbiddenError);

      const created = await createResource(
        {
          name: "Admin Created Room",
          typeId,
          location: "Wing A",
          capacity: 10,
          openTime: "08:00",
          closeTime: "18:00",
          isActive: true,
        },
        adminUser
      );

      createdResourceIds.push(created.id);
      expect(created.id).toBeDefined();
      expect(created.name).toBe("Admin Created Room");
    });

    it("fetches resource by id or throws NotFoundError", async () => {
      const id = createdResourceIds[0] ?? "";
      const fetched = await getResourceById(id);
      expect(fetched.id).toBe(id);

      await expect(getResourceById("non-existent-id")).rejects.toThrow(
        NotFoundError
      );
    });

    it("updates resource as admin and forbids member", async () => {
      const id = createdResourceIds[0] ?? "";

      await expect(
        updateResource(id, { name: "Hacked Name" }, memberUser)
      ).rejects.toThrow(ForbiddenError);

      const updated = await updateResource(
        id,
        { name: "Updated Room Name", capacity: 15 },
        adminUser
      );
      expect(updated.name).toBe("Updated Room Name");
      expect(updated.capacity).toBe(15);
    });
  });

  describe("Deactivation and deletion safety", () => {
    it("returns future confirmed reservation count on deactivation", async () => {
      const res = await createResource(
        {
          name: "Deactivate Test Room",
          typeId,
          openTime: "08:00",
          closeTime: "20:00",
          isActive: true,
        },
        adminUser
      );
      createdResourceIds.push(res.id);

      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(futureStart.getTime() + 3600000);

      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.reservation.create({
          data: {
            resourceId: res.id,
            userId: user.id,
            title: "Future Confirmed Booking",
            startTime: futureStart,
            endTime: futureEnd,
            status: ReservationStatus.CONFIRMED,
          },
        });
      }

      const deactivationResult = await setResourceActive(
        res.id,
        false,
        adminUser
      );
      expect(deactivationResult.resource.isActive).toBe(false);
      expect(deactivationResult.futureConfirmedCount).toBeGreaterThanOrEqual(1);

      const reactivationResult = await setResourceActive(
        res.id,
        true,
        adminUser
      );
      expect(reactivationResult.resource.isActive).toBe(true);
      expect(reactivationResult.futureConfirmedCount).toBe(0);
    });

    it("prevents deleting a resource with reservations with ConflictError", async () => {
      const resIdWithBookings = createdResourceIds[1] ?? "";

      await expect(
        deleteResource(resIdWithBookings, adminUser)
      ).rejects.toThrow(ConflictError);
    });

    it("allows deleting an unused resource", async () => {
      const unused = await createResource(
        {
          name: "Unused Room",
          typeId,
          openTime: "09:00",
          closeTime: "17:00",
          isActive: true,
        },
        adminUser
      );

      const deleted = await deleteResource(unused.id, adminUser);
      expect(deleted.id).toBe(unused.id);
    });
  });

  describe("Listing, filtering and pagination", () => {
    it("filters by status, search, and returns pagination metadata", async () => {
      const result = await listResources({
        status: "ACTIVE",
        page: 1,
        pageSize: 5,
      });

      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(typeof result.totalPages).toBe("number");

      for (const item of result.items) {
        expect(item.isActive).toBe(true);
      }
    });

    it("lists resource types", async () => {
      const types = await listResourceTypes();
      expect(types.length).toBeGreaterThanOrEqual(1);
    });
  });
});
