import { formatInTimeZone } from "date-fns-tz";
import {
  DEFAULT_ORG_TIMEZONE,
  MAX_ADVANCE_DAYS,
  MAX_RESERVATION_HOURS,
  MIN_RESERVATION_MINUTES,
  MS_PER_DAY,
  MS_PER_MINUTE,
} from "@/lib/constants";
import { ValidationError } from "@/lib/errors";
import {
  isOnFifteenMinuteStep,
  validateFifteenMinuteSteps,
} from "@/lib/services/rule-time-helpers";

export { isOnFifteenMinuteStep, validateFifteenMinuteSteps };

export interface ValidateReservationRulesParams {
  startTime: Date;
  endTime: Date;
  openTime: string;
  closeTime: string;
  timezone?: string;
  isActive?: boolean;
}

export function validateTimeOrder(startTime: Date, endTime: Date): void {
  if (endTime.getTime() <= startTime.getTime()) {
    throw new ValidationError("End time must be after start time");
  }
}

export function validateNotPast(startTime: Date, now: Date = new Date()): void {
  if (startTime.getTime() < now.getTime()) {
    throw new ValidationError("Reservation cannot start in the past");
  }
}

export function validateDuration(startTime: Date, endTime: Date): void {
  const durationMinutes =
    (endTime.getTime() - startTime.getTime()) / MS_PER_MINUTE;
  if (durationMinutes < MIN_RESERVATION_MINUTES) {
    throw new ValidationError(
      `Reservation duration must be at least ${MIN_RESERVATION_MINUTES} minutes`
    );
  }
  if (durationMinutes > MAX_RESERVATION_HOURS * 60) {
    throw new ValidationError(
      `Reservation duration cannot exceed ${MAX_RESERVATION_HOURS} hours`
    );
  }
}

export function validateOperatingHours(
  startTime: Date,
  endTime: Date,
  openTime: string,
  closeTime: string,
  timezone: string = DEFAULT_ORG_TIMEZONE
): void {
  const startDate = formatInTimeZone(startTime, timezone, "yyyy-MM-dd");
  const endDate = formatInTimeZone(endTime, timezone, "yyyy-MM-dd");
  if (startDate !== endDate) {
    throw new ValidationError(
      "Reservation must start and end on the same day within operating hours"
    );
  }

  const startHHmm = formatInTimeZone(startTime, timezone, "HH:mm");
  const endHHmm = formatInTimeZone(endTime, timezone, "HH:mm");

  if (startHHmm < openTime || endHHmm > closeTime) {
    throw new ValidationError(
      `Reservation must be within resource operating hours (${openTime} - ${closeTime})`
    );
  }
}

export function validateAdvanceBooking(
  startTime: Date,
  now: Date = new Date(),
  maxAdvanceDays: number = MAX_ADVANCE_DAYS
): void {
  if (startTime.getTime() > now.getTime() + maxAdvanceDays * MS_PER_DAY) {
    throw new ValidationError(
      `Reservation cannot be made more than ${maxAdvanceDays} days in advance`
    );
  }
}

export function validateResourceActive(isActive: boolean): void {
  if (!isActive) {
    throw new ValidationError("Cannot book an inactive resource");
  }
}

export function validateReservationRules(
  params: ValidateReservationRulesParams,
  now: Date = new Date()
): void {
  if (params.isActive !== undefined) {
    validateResourceActive(params.isActive);
  }
  validateTimeOrder(params.startTime, params.endTime);
  validateNotPast(params.startTime, now);
  validateDuration(params.startTime, params.endTime);
  const tz = params.timezone ?? DEFAULT_ORG_TIMEZONE;
  validateFifteenMinuteSteps(params.startTime, params.endTime, tz);
  validateOperatingHours(
    params.startTime,
    params.endTime,
    params.openTime,
    params.closeTime,
    tz
  );
  validateAdvanceBooking(params.startTime, now);
}
