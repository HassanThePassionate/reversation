import { describe, expect, it } from "vitest";
import { parseAvailabilityQuery } from "@/lib/services/availability-params";
import { availabilitySearchSchema } from "@/lib/validation/availability";

describe("Availability Search Validation (Unit Tests)", () => {
  it("accepts valid search parameters and defaults duration to 60", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "10:00",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBe("2026-10-25");
      expect(result.data.startTime).toBe("10:00");
      expect(result.data.duration).toBe(60);
    }
  });

  it("accepts valid full parameters with typeId and capacity", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "14:30",
      duration: "120",
      typeId: "type-conf-1",
      minCapacity: "10",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration).toBe(120);
      expect(result.data.minCapacity).toBe(10);
      expect(result.data.typeId).toBe("type-conf-1");
    }
  });

  it("rejects invalid date format without crashing", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "25-10-2026", // Wrong format
      startTime: "10:00",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.date).toBeDefined();
    }
  });

  it("rejects invalid start time format without crashing", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "26:00", // Invalid hour
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.startTime).toBeDefined();
    }
  });

  it("rejects duration less than 15 minutes", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "10:00",
      duration: "10",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.duration).toBeDefined();
    }
  });

  it("rejects duration greater than 8 hours (480 minutes)", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "10:00",
      duration: "500",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.duration).toBeDefined();
    }
  });

  it("rejects minCapacity less than 1", () => {
    const result = availabilitySearchSchema.safeParse({
      date: "2026-10-25",
      startTime: "10:00",
      minCapacity: "0",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.minCapacity).toBeDefined();
    }
  });

  it("parseAvailabilityQuery handles defaults and computes localized slot bounds", () => {
    const q = parseAvailabilityQuery({}, "Asia/Karachi");
    expect(q.queryTime).toBe("10:00");
    expect(q.queryDuration).toBe(60);
    expect(q.formattedEndTime).toBe("11:00");
  });
});
