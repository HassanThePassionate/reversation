import { describe, expect, it } from "vitest";
import {
  buildTimelineSegments,
  type TimelineReservation,
} from "@/lib/services/timeline-segments";

describe("buildTimelineSegments (Pure Function Unit Tests)", () => {
  // Operating hours: 08:00 to 20:00 (12 hours window)
  const dayOpen = new Date("2026-10-15T03:00:00.000Z"); // 08:00 PKT
  const dayClose = new Date("2026-10-15T15:00:00.000Z"); // 20:00 PKT

  it("handles empty day: returns single free segment for entire operating window", () => {
    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [],
    });

    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({
      type: "free",
      start: dayOpen,
      end: dayClose,
    });
  });

  it("handles back-to-back bookings with no free gap between them", () => {
    const res1: TimelineReservation = {
      id: "res-1",
      title: "Morning Meeting",
      startTime: new Date("2026-10-15T05:00:00.000Z"), // 10:00 PKT
      endTime: new Date("2026-10-15T07:00:00.000Z"), // 12:00 PKT
      bookerName: "Alice",
    };

    const res2: TimelineReservation = {
      id: "res-2",
      title: "Lunch Workshop",
      startTime: new Date("2026-10-15T07:00:00.000Z"), // 12:00 PKT (Back to back)
      endTime: new Date("2026-10-15T09:00:00.000Z"), // 14:00 PKT
      bookerName: "Bob",
    };

    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [res1, res2],
    });

    // Expect: free (08:00-10:00), booked (10:00-12:00), booked (12:00-14:00), free (14:00-20:00)
    expect(segments).toHaveLength(4);
    expect(segments[0]?.type).toBe("free");
    expect(segments[0]?.start).toEqual(dayOpen);
    expect(segments[0]?.end).toEqual(res1.startTime);

    expect(segments[1]?.type).toBe("booked");
    expect(segments[1]?.start).toEqual(res1.startTime);
    expect(segments[1]?.end).toEqual(res1.endTime);
    expect(segments[1]?.reservation?.id).toBe("res-1");

    expect(segments[2]?.type).toBe("booked");
    expect(segments[2]?.start).toEqual(res2.startTime);
    expect(segments[2]?.end).toEqual(res2.endTime);
    expect(segments[2]?.reservation?.id).toBe("res-2");

    expect(segments[3]?.type).toBe("free");
    expect(segments[3]?.start).toEqual(res2.endTime);
    expect(segments[3]?.end).toEqual(dayClose);
  });

  it("handles booking crossing opening time by clamping start to dayOpen", () => {
    const earlyBooking: TimelineReservation = {
      id: "res-early",
      title: "Overnight / Early Setup",
      startTime: new Date("2026-10-15T02:00:00.000Z"), // 07:00 PKT (Before 08:00 open)
      endTime: new Date("2026-10-15T05:00:00.000Z"), // 10:00 PKT
      bookerName: "Charlie",
    };

    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [earlyBooking],
    });

    expect(segments).toHaveLength(2);
    // Clamped booked segment from dayOpen (08:00) to 10:00
    expect(segments[0]?.type).toBe("booked");
    expect(segments[0]?.start).toEqual(dayOpen);
    expect(segments[0]?.end).toEqual(earlyBooking.endTime);

    // Free segment from 10:00 to dayClose
    expect(segments[1]?.type).toBe("free");
    expect(segments[1]?.start).toEqual(earlyBooking.endTime);
    expect(segments[1]?.end).toEqual(dayClose);
  });

  it("handles booking crossing closing time by clamping end to dayClose", () => {
    const lateBooking: TimelineReservation = {
      id: "res-late",
      title: "Late Session",
      startTime: new Date("2026-10-15T13:00:00.000Z"), // 18:00 PKT
      endTime: new Date("2026-10-15T16:00:00.000Z"), // 21:00 PKT (After 20:00 close)
      bookerName: "Diana",
    };

    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [lateBooking],
    });

    expect(segments).toHaveLength(2);
    expect(segments[0]?.type).toBe("free");
    expect(segments[0]?.start).toEqual(dayOpen);
    expect(segments[0]?.end).toEqual(lateBooking.startTime);

    expect(segments[1]?.type).toBe("booked");
    expect(segments[1]?.start).toEqual(lateBooking.startTime);
    expect(segments[1]?.end).toEqual(dayClose);
  });

  it("handles fully booked day with no free segments", () => {
    const fullDayBooking: TimelineReservation = {
      id: "res-full",
      title: "All Day Conference",
      startTime: dayOpen,
      endTime: dayClose,
      bookerName: "Admin",
    };

    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [fullDayBooking],
    });

    expect(segments).toHaveLength(1);
    expect(segments[0]?.type).toBe("booked");
    expect(segments[0]?.start).toEqual(dayOpen);
    expect(segments[0]?.end).toEqual(dayClose);
  });

  it("ignores reservations entirely outside the operating window", () => {
    const outsideBooking: TimelineReservation = {
      id: "res-outside",
      title: "Middle of the night",
      startTime: new Date("2026-10-15T00:00:00.000Z"), // 05:00 PKT
      endTime: new Date("2026-10-15T01:00:00.000Z"), // 06:00 PKT
      bookerName: "Night Owl",
    };

    const segments = buildTimelineSegments({
      dayOpen,
      dayClose,
      reservations: [outsideBooking],
    });

    expect(segments).toHaveLength(1);
    expect(segments[0]?.type).toBe("free");
    expect(segments[0]?.start).toEqual(dayOpen);
    expect(segments[0]?.end).toEqual(dayClose);
  });
});
