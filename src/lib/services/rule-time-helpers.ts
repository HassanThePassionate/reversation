import { toZonedTime } from "date-fns-tz";
import {
  DEFAULT_ORG_TIMEZONE,
  RESERVATION_INTERVAL_MINUTES,
} from "@/lib/constants";
import { ValidationError } from "@/lib/errors";

export function isOnFifteenMinuteStep(
  date: Date,
  timezone: string = DEFAULT_ORG_TIMEZONE
): boolean {
  const zoned = toZonedTime(date, timezone);
  return (
    zoned.getSeconds() === 0 &&
    zoned.getMilliseconds() === 0 &&
    zoned.getMinutes() % RESERVATION_INTERVAL_MINUTES === 0
  );
}

export function validateFifteenMinuteSteps(
  startTime: Date,
  endTime: Date,
  timezone: string = DEFAULT_ORG_TIMEZONE
): void {
  if (!isOnFifteenMinuteStep(startTime, timezone)) {
    throw new ValidationError("Start time must be in 15-minute intervals");
  }
  if (!isOnFifteenMinuteStep(endTime, timezone)) {
    throw new ValidationError("End time must be in 15-minute intervals");
  }
}
