export interface TimelineReservation {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  bookerName: string;
}

export interface TimelineSegment {
  type: "free" | "booked";
  start: Date;
  end: Date;
  reservation?: TimelineReservation;
}

export interface BuildTimelineSegmentsParams {
  dayOpen: Date;
  dayClose: Date;
  reservations: TimelineReservation[];
}

export function buildTimelineSegments({
  dayOpen,
  dayClose,
  reservations,
}: BuildTimelineSegmentsParams): TimelineSegment[] {
  if (dayClose.getTime() <= dayOpen.getTime()) {
    return [];
  }

  const sorted = [...reservations].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  const segments: TimelineSegment[] = [];
  let currentPointer = new Date(dayOpen);

  for (const res of sorted) {
    if (res.endTime <= dayOpen || res.startTime >= dayClose) {
      continue;
    }

    const clampedStart =
      res.startTime.getTime() < dayOpen.getTime() ? dayOpen : res.startTime;
    const clampedEnd =
      res.endTime.getTime() > dayClose.getTime() ? dayClose : res.endTime;

    const effectiveStart =
      clampedStart.getTime() < currentPointer.getTime()
        ? currentPointer
        : clampedStart;

    if (clampedEnd.getTime() <= effectiveStart.getTime()) {
      continue;
    }

    if (effectiveStart.getTime() > currentPointer.getTime()) {
      segments.push({
        type: "free",
        start: new Date(currentPointer),
        end: new Date(effectiveStart),
      });
    }

    segments.push({
      type: "booked",
      start: new Date(effectiveStart),
      end: new Date(clampedEnd),
      reservation: res,
    });

    currentPointer = new Date(clampedEnd);
  }

  if (currentPointer.getTime() < dayClose.getTime()) {
    segments.push({
      type: "free",
      start: new Date(currentPointer),
      end: new Date(dayClose),
    });
  }

  return segments;
}
