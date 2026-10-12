import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { DEFAULT_ORG_TIMEZONE, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { env } from "@/lib/env";

const parseDateTimeLocal = z
  .union([z.date(), z.string().min(1, "Date and time is required")])
  .transform((val, ctx) => {
    if (val instanceof Date) {
      if (Number.isNaN(val.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid date value",
        });
        return z.NEVER;
      }
      return val;
    }
    const timezone = env.NEXT_PUBLIC_ORG_TIMEZONE || DEFAULT_ORG_TIMEZONE;
    const parsed = fromZonedTime(val, timezone);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid datetime format",
      });
      return z.NEVER;
    }
    return parsed;
  });

const optionalDateFilter = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() === "") return undefined;
  if (!val) return undefined;
  return val;
}, z.coerce.date().optional());

export const createReservationSchema = z.object({
  resourceId: z.string().min(1, "Resource ID is required"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),
  startTime: parseDateTimeLocal,
  endTime: parseDateTimeLocal,
});

export const rescheduleReservationSchema = z.object({
  startTime: parseDateTimeLocal,
  endTime: parseDateTimeLocal,
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export const reservationFilterSchema = z.object({
  resourceId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["ALL", "CONFIRMED", "CANCELLED"]).default("ALL"),
  startDate: optionalDateFilter,
  endDate: optionalDateFilter,
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type RescheduleReservationInput = z.infer<
  typeof rescheduleReservationSchema
>;
export type ReservationFilterInput = z.infer<typeof reservationFilterSchema>;

export function parseReservationFilters(
  raw: Record<string, string | undefined>
): ReservationFilterInput {
  const parsed = reservationFilterSchema.safeParse(raw);
  return parsed.success
    ? parsed.data
    : { status: "ALL", page: 1, pageSize: DEFAULT_PAGE_SIZE };
}
