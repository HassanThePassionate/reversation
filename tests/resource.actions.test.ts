import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createResourceAction,
  updateResourceAction,
  deactivateResourceAction,
  activateResourceAction,
} from "@/actions/resource.actions";
import { Role } from "@prisma/client";
import { ForbiddenError } from "@/lib/errors";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT");
    (error as unknown as { digest: string }).digest =
      `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockRequireAdmin = vi.fn();
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockSetActive = vi.fn();
vi.mock("@/lib/services/resource.service", () => ({
  createResource: (...args: unknown[]) => mockCreate(...args),
  updateResource: (...args: unknown[]) => mockUpdate(...args),
  setResourceActive: (...args: unknown[]) => mockSetActive(...args),
}));

describe("Resource Server Actions", () => {
  const adminUser = {
    id: "admin-1",
    name: "Admin User",
    email: "admin@test.com",
    role: Role.ADMIN,
    teamId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(adminUser);
  });

  describe("createResourceAction", () => {
    it("returns validation errors if required fields are missing", async () => {
      const formData = new FormData();
      formData.set("name", "");
      formData.set("typeId", "");

      const result = await createResourceAction(null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.fieldErrors?.name).toBeDefined();
        expect(result.fieldErrors?.typeId).toBeDefined();
      }
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("creates resource and redirects when valid", async () => {
      const formData = new FormData();
      formData.set("name", "New Boardroom");
      formData.set("typeId", "type-123");
      formData.set("openTime", "08:00");
      formData.set("closeTime", "18:00");
      formData.set("isActive", "true");

      mockCreate.mockResolvedValue({ id: "res-new" });

      await expect(createResourceAction(null, formData)).rejects.toThrow(
        "NEXT_REDIRECT"
      );
      expect(mockCreate).toHaveBeenCalled();
    });

    it("rejects non-admin users with ForbiddenError", async () => {
      mockRequireAdmin.mockRejectedValue(
        new ForbiddenError("Admin access required")
      );
      const formData = new FormData();
      formData.set("name", "Test");
      formData.set("typeId", "type-1");

      const result = await createResourceAction(null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Admin access required");
      }
    });
  });

  describe("updateResourceAction", () => {
    it("returns validation error if openTime >= closeTime", async () => {
      const formData = new FormData();
      formData.set("name", "Conference Room");
      formData.set("typeId", "type-1");
      formData.set("openTime", "18:00");
      formData.set("closeTime", "09:00");

      const result = await updateResourceAction("res-1", null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.fieldErrors?.closeTime).toBeDefined();
      }
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("updates resource and redirects on success", async () => {
      const formData = new FormData();
      formData.set("name", "Updated Room");
      formData.set("typeId", "type-1");
      formData.set("openTime", "09:00");
      formData.set("closeTime", "17:00");

      mockUpdate.mockResolvedValue({ id: "res-1" });

      await expect(
        updateResourceAction("res-1", null, formData)
      ).rejects.toThrow("NEXT_REDIRECT");
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("deactivateResourceAction and activateResourceAction", () => {
    it("deactivates resource and returns future confirmed reservation count", async () => {
      mockSetActive.mockResolvedValue({
        resource: { id: "res-1", isActive: false },
        futureConfirmedCount: 3,
      });

      const result = await deactivateResourceAction("res-1");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.futureConfirmedCount).toBe(3);
      }
      expect(mockSetActive).toHaveBeenCalledWith("res-1", false, adminUser);
    });

    it("activates resource successfully", async () => {
      mockSetActive.mockResolvedValue({
        resource: { id: "res-1", isActive: true },
        futureConfirmedCount: 0,
      });

      const result = await activateResourceAction("res-1");
      expect(result.success).toBe(true);
      expect(mockSetActive).toHaveBeenCalledWith("res-1", true, adminUser);
    });
  });
});
