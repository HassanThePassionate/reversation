import {
  POSTGRES_EXCLUSION_ERROR_CODE,
  RESERVATIONS_EXCLUSION_CONSTRAINT,
} from "@/lib/constants";
import { ConflictError } from "@/lib/errors";

export function isExclusionConstraintError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    if ("code" in error && error.code === POSTGRES_EXCLUSION_ERROR_CODE) {
      return true;
    }
    if ("message" in error && typeof error.message === "string") {
      return (
        error.message.includes(POSTGRES_EXCLUSION_ERROR_CODE) ||
        error.message.includes(RESERVATIONS_EXCLUSION_CONSTRAINT)
      );
    }
  }
  return false;
}

export function handleDbError(error: unknown): never {
  if (isExclusionConstraintError(error)) {
    throw new ConflictError(
      "This slot was just booked by another user. Please choose a different time."
    );
  }
  throw error;
}
