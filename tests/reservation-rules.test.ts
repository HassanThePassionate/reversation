import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/errors";
import {
  isOnFifteenMinuteStep,
  validateAdvanceBooking,
  validateDuration,
  validateFifteenMinuteSteps,
  validateNotPast,
  validateOperatingHours,
  validateReservationRules,
  validateResourceActive,
  validateTimeOrder,
} from "@/lib/services/reservation-rules";

describe("Reservation Business Rules (Unit Tests)", () => {
  const timezone = "Asia/Karachi";

  describe("Time order (start before end)", () => {
    it("accepts start time before end time", () => {
      const start = new Date("2026-10-15T05:00:00.000Z");
      const end = new Date("2026-10-15T06:00:00.000Z");
      expect(() => validateTimeOrder(start, end)).not.toThrow();
    });

    it("rejects identical start and end time with ValidationError", () => {
      const time = new Date("2026-10-15T05:00:00.000Z");
      expect(() => validateTimeOrder(time, time)).toThrow(ValidationError);
      expect(() => validateTimeOrder(time, time)).toThrow(
        "End time must be after start time"
      );
    });

    it("rejects start time after end time with ValidationError", () => {
      const start = new Date("2026-10-15T06:00:00.000Z");
      const end = new Date("2026-10-15T05:00:00.000Z");
      expect(() => validateTimeOrder(start, end)).toThrow(ValidationError);
    });
  });

  describe("Not in the past", () => {
    const fixedNow = new Date("2026-10-15T05:00:00.000Z");

    it("accepts future start time", () => {
      const start = new Date("2026-10-15T06:00:00.000Z");
      expect(() => validateNotPast(start, fixedNow)).not.toThrow();
    });

    it("accepts start time equal to now", () => {
      expect(() => validateNotPast(fixedNow, fixedNow)).not.toThrow();
    });

    it("rejects start time in the past with ValidationError", () => {
      const pastStart = new Date("2026-10-15T04:59:59.000Z");
      expect(() => validateNotPast(pastStart, fixedNow)).toThrow(
        ValidationError
      );
      expect(() => validateNotPast(pastStart, fixedNow)).toThrow(
        "Reservation cannot start in the past"
      );
    });
  });

  describe("15-minute step alignment", () => {
    it("correctly identifies valid 15-minute steps in timezone", () => {
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:00:00.000Z"), timezone)
      ).toBe(true); // 10:00 PKT
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:15:00.000Z"), timezone)
      ).toBe(true); // 10:15 PKT
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:30:00.000Z"), timezone)
      ).toBe(true); // 10:30 PKT
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:45:00.000Z"), timezone)
      ).toBe(true); // 10:45 PKT
    });

    it("rejects non-15-minute minute values", () => {
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:07:00.000Z"), timezone)
      ).toBe(false);
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:22:00.000Z"), timezone)
      ).toBe(false);
    });

    it("rejects times with non-zero seconds or milliseconds", () => {
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:00:15.000Z"), timezone)
      ).toBe(false);
      expect(
        isOnFifteenMinuteStep(new Date("2026-10-15T05:00:00.150Z"), timezone)
      ).toBe(false);
    });

    it("throws ValidationError when start or end is not on 15-minute step", () => {
      const validStart = new Date("2026-10-15T05:00:00.000Z");
      const invalidEnd = new Date("2026-10-15T05:20:00.000Z");
      expect(() =>
        validateFifteenMinuteSteps(validStart, invalidEnd, timezone)
      ).toThrow("End time must be in 15-minute intervals");

      const invalidStart = new Date("2026-10-15T05:05:00.000Z");
      const validEnd = new Date("2026-10-15T05:30:00.000Z");
      expect(() =>
        validateFifteenMinuteSteps(invalidStart, validEnd, timezone)
      ).toThrow("Start time must be in 15-minute intervals");
    });
  });

  describe("Duration boundaries (min 15 min, max 8 hours)", () => {
    it("accepts boundary: exactly 15 minutes", () => {
      const start = new Date("2026-10-15T05:00:00.000Z");
      const end = new Date("2026-10-15T05:15:00.000Z");
      expect(() => validateDuration(start, end)).not.toThrow();
    });

    it("rejects boundary: 14 minutes with ValidationError", () => {
      const start = new Date("2026-10-15T05:00:00.000Z");
      const end = new Date("2026-10-15T05:14:00.000Z");
      expect(() => validateDuration(start, end)).toThrow(ValidationError);
      expect(() => validateDuration(start, end)).toThrow(
        "Reservation duration must be at least 15 minutes"
      );
    });

    it("accepts boundary: exactly 8 hours (480 minutes)", () => {
      const start = new Date("2026-10-15T05:00:00.000Z");
      const end = new Date("2026-10-15T13:00:00.000Z"); // 8 hours
      expect(() => validateDuration(start, end)).not.toThrow();
    });

    it("rejects boundary: 8 hours 15 minutes with ValidationError", () => {
      const start = new Date("2026-10-15T05:00:00.000Z");
      const end = new Date("2026-10-15T13:15:00.000Z");
      expect(() => validateDuration(start, end)).toThrow(ValidationError);
      expect(() => validateDuration(start, end)).toThrow(
        "Reservation duration cannot exceed 8 hours"
      );
    });
  });

  describe("Operating hours boundaries (org timezone)", () => {
    const openTime = "08:00";
    const closeTime = "20:00";

    it("accepts boundary: exactly at opening time (08:00 PKT)", () => {
      // 08:00 PKT = 03:00 UTC
      const start = new Date("2026-10-15T03:00:00.000Z");
      const end = new Date("2026-10-15T04:00:00.000Z");
      expect(() =>
        validateOperatingHours(start, end, openTime, closeTime, timezone)
      ).not.toThrow();
    });

    it("accepts boundary: exactly at closing time (20:00 PKT)", () => {
      // 20:00 PKT = 15:00 UTC
      const start = new Date("2026-10-15T14:00:00.000Z");
      const end = new Date("2026-10-15T15:00:00.000Z");
      expect(() =>
        validateOperatingHours(start, end, openTime, closeTime, timezone)
      ).not.toThrow();
    });

    it("rejects boundary: 07:45 PKT (before opening time)", () => {
      // 07:45 PKT = 02:45 UTC
      const start = new Date("2026-10-15T02:45:00.000Z");
      const end = new Date("2026-10-15T04:00:00.000Z");
      expect(() =>
        validateOperatingHours(start, end, openTime, closeTime, timezone)
      ).toThrow(
        "Reservation must be within resource operating hours (08:00 - 20:00)"
      );
    });

    it("rejects boundary: 20:15 PKT (after closing time)", () => {
      // 20:15 PKT = 15:15 UTC
      const start = new Date("2026-10-15T14:00:00.000Z");
      const end = new Date("2026-10-15T15:15:00.000Z");
      expect(() =>
        validateOperatingHours(start, end, openTime, closeTime, timezone)
      ).toThrow(
        "Reservation must be within resource operating hours (08:00 - 20:00)"
      );
    });

    it("rejects bookings that span multiple days across midnight", () => {
      const start = new Date("2026-10-15T14:00:00.000Z");
      const end = new Date("2026-10-16T04:00:00.000Z");
      expect(() =>
        validateOperatingHours(start, end, openTime, closeTime, timezone)
      ).toThrow(
        "Reservation must start and end on the same day within operating hours"
      );
    });
  });

  describe("Max advance days", () => {
    const fixedNow = new Date("2026-10-15T05:00:00.000Z");

    it("accepts booking within 90 days", () => {
      const start = new Date(fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(() => validateAdvanceBooking(start, fixedNow, 90)).not.toThrow();
    });

    it("accepts boundary: exactly 90 days advance", () => {
      const start = new Date(fixedNow.getTime() + 90 * 24 * 60 * 60 * 1000);
      expect(() => validateAdvanceBooking(start, fixedNow, 90)).not.toThrow();
    });

    it("rejects booking beyond 90 days with ValidationError", () => {
      const start = new Date(
        fixedNow.getTime() + 90 * 24 * 60 * 60 * 1000 + 1000
      );
      expect(() => validateAdvanceBooking(start, fixedNow, 90)).toThrow(
        ValidationError
      );
      expect(() => validateAdvanceBooking(start, fixedNow, 90)).toThrow(
        "Reservation cannot be made more than 90 days in advance"
      );
    });
  });

  describe("Resource active check", () => {
    it("accepts active resource", () => {
      expect(() => validateResourceActive(true)).not.toThrow();
    });

    it("rejects inactive resource with ValidationError", () => {
      expect(() => validateResourceActive(false)).toThrow(ValidationError);
      expect(() => validateResourceActive(false)).toThrow(
        "Cannot book an inactive resource"
      );
    });
  });

  describe("Combined validateReservationRules orchestrator", () => {
    const fixedNow = new Date("2026-10-15T03:00:00.000Z");

    it("passes for a valid booking", () => {
      expect(() =>
        validateReservationRules(
          {
            startTime: new Date("2026-10-15T05:00:00.000Z"), // 10:00 PKT
            endTime: new Date("2026-10-15T06:00:00.000Z"), // 11:00 PKT
            openTime: "08:00",
            closeTime: "20:00",
            timezone,
            isActive: true,
          },
          fixedNow
        )
      ).not.toThrow();
    });
  });
});
