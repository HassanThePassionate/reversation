export const BCRYPT_SALT_ROUNDS = 10;
export const DEFAULT_ORG_TIMEZONE = "Asia/Karachi";
export const MIN_RESERVATION_MINUTES = 15;
export const MAX_RESERVATION_HOURS = 8;
export const MAX_ADVANCE_DAYS = 90;
export const RESERVATION_INTERVAL_MINUTES = 15;
export const SESSION_COOKIE_NAME = "session_token";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
export const DEFAULT_PAGE_SIZE = 10;
export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const POSTGRES_EXCLUSION_ERROR_CODE = "23P01";
export const RESERVATIONS_EXCLUSION_CONSTRAINT = "reservations_no_overlap";

export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
export const SEVEN_DAYS_MS = 7 * MS_PER_DAY;

export const DASHBOARD_TODAY_LIMIT = 6;
export const DASHBOARD_UPCOMING_LIMIT = 5;

export const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 480, label: "8 hours" },
] as const;
