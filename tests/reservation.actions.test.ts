import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelReservationAction,
  createReservationAction,
  rescheduleReservationAction,
} from "@/actions/reservation.actions";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import { Role } from "@prisma/client";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockRequireUser = vi.fn();
vi.mock("@/lib/auth/guards", () => ({
  requireUser: () => mockRequireUser(),
}));

const mockCreateReservation = vi.fn();
const mockRescheduleReservation = vi.fn();
const mockCancelReservation = vi.fn();

vi.mock("@/lib/services/reservation.service", () => ({
  createReservation: (...args: unknown[]) => mockCreateReservation(...args),
  rescheduleReservation: (...args: unknown[]) =>
    mockRescheduleReservation(...args),
  cancelReservation: (...args: unknown[]) => mockCancelReservation(...args),
}));

describe("Reservation Server Actions", () => {
  const memberUser = {
    id: "user-test-1",
    name: "Member User",
    email: "member@test.com",
    role: Role.MEMBER,
    teamId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUser.mockResolvedValue(memberUser);
  });

  describe("createReservationAction", () => {
    it("returns field-level errors when required fields are missing", async () => {
      const formData = new FormData();
      formData.set("resourceId", "");
      formData.set("title", "");
      formData.set("startTime", "");
      formData.set("endTime", "");

      const result = await createReservationAction(null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Please correct the form errors.");
        expect(result.fieldErrors?.title).toBeDefined();
        expect(result.fieldErrors?.resourceId).toBeDefined();
      }
      expect(mockCreateReservation).not.toHaveBeenCalled();
    });

    it("creates reservation and revalidates on valid input", async () => {
      const formData = new FormData();
      formData.set("resourceId", "res-123");
      formData.set("title", "Executive Sync");
      formData.set("startTime", "2026-10-20T10:00");
      formData.set("endTime", "2026-10-20T11:00");
      formData.set("notes", "Discuss quarterly OKRs");

      mockCreateReservation.mockResolvedValue({ id: "res-new" });

      const result = await createReservationAction(null, formData);
      expect(result.success).toBe(true);
      expect(mockCreateReservation).toHaveBeenCalled();
    });

    it("returns conflict error message without crashing when overlap occurs", async () => {
      const formData = new FormData();
      formData.set("resourceId", "res-123");
      formData.set("title", "Overlapping Sync");
      formData.set("startTime", "2026-10-20T10:00");
      formData.set("endTime", "2026-10-20T11:00");

      mockCreateReservation.mockRejectedValue(
        new ConflictError(
          "Slot conflicts with existing reservation (2026-10-20 10:00 - 11:00)"
        )
      );

      const result = await createReservationAction(null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain(
          "Slot conflicts with existing reservation"
        );
      }
    });

    it("returns unauthorized error if user is unauthenticated", async () => {
      mockRequireUser.mockRejectedValue(new UnauthorizedError("Please log in"));
      const formData = new FormData();
      formData.set("resourceId", "res-123");
      formData.set("title", "Test");

      const result = await createReservationAction(null, formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Please log in");
      }
    });
  });

  describe("rescheduleReservationAction", () => {
    it("returns field-level errors when times are missing", async () => {
      const formData = new FormData();
      formData.set("startTime", "");
      formData.set("endTime", "");

      const result = await rescheduleReservationAction(
        "res-id",
        null,
        formData
      );
      expect(result.success).toBe(false);
      expect(mockRescheduleReservation).not.toHaveBeenCalled();
    });

    it("reschedules reservation and revalidates on valid input", async () => {
      const formData = new FormData();
      formData.set("title", "Updated Sync");
      formData.set("startTime", "2026-10-20T11:00");
      formData.set("endTime", "2026-10-20T12:00");

      mockRescheduleReservation.mockResolvedValue({
        id: "res-id",
        resourceId: "room-1",
      });

      const result = await rescheduleReservationAction(
        "res-id",
        null,
        formData
      );
      expect(result.success).toBe(true);
      expect(mockRescheduleReservation).toHaveBeenCalled();
    });
  });

  describe("cancelReservationAction", () => {
    it("cancels reservation successfully and revalidates", async () => {
      mockCancelReservation.mockResolvedValue({
        id: "res-id",
        resourceId: "room-1",
      });

      const result = await cancelReservationAction("res-id");
      expect(result.success).toBe(true);
      expect(mockCancelReservation).toHaveBeenCalledWith("res-id", memberUser);
    });
  });
});
