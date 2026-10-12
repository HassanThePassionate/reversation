import { z } from "zod";
import { TIME_FORMAT_REGEX } from "@/lib/constants";

export const availabilitySearchSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  startTime: z
    .string()
    .trim()
    .regex(
      TIME_FORMAT_REGEX,
      "Start time must be in HH:mm format (00:00-23:59)"
    )
    .optional(),
  duration: z.coerce
    .number()
    .int("Duration must be an integer in minutes")
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 8 hours")
    .default(60),
  typeId: z.string().trim().optional(),
  minCapacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .optional(),
});

export type AvailabilitySearchInput = z.infer<typeof availabilitySearchSchema>;
