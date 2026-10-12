import { z } from "zod";
import { DEFAULT_PAGE_SIZE, TIME_FORMAT_REGEX } from "@/lib/constants";

export const resourceBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Resource name is required")
    .max(100, "Name cannot exceed 100 characters"),
  typeId: z.string().min(1, "Resource type is required"),
  location: z.string().trim().max(100).optional().nullable(),
  capacity: z.coerce
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .optional()
    .nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  openTime: z
    .string()
    .regex(
      TIME_FORMAT_REGEX,
      "Open time must be in HH:mm format (00:00-23:59)"
    ),
  closeTime: z
    .string()
    .regex(
      TIME_FORMAT_REGEX,
      "Close time must be in HH:mm format (00:00-23:59)"
    ),
  isActive: z.boolean().default(true),
});

export const resourceSchema = resourceBaseSchema.refine(
  (data) => data.openTime < data.closeTime,
  {
    message: "Opening time must be earlier than closing time",
    path: ["closeTime"],
  }
);

export const resourceUpdateSchema = resourceBaseSchema.partial().refine(
  (data) => {
    if (data.openTime && data.closeTime) {
      return data.openTime < data.closeTime;
    }
    return true;
  },
  {
    message: "Opening time must be earlier than closing time",
    path: ["closeTime"],
  }
);

export const resourceFilterSchema = z.object({
  search: z.string().trim().optional(),
  typeId: z.string().optional(),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).default("ALL"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
});

export type CreateResourceInput = z.infer<typeof resourceSchema>;
export type UpdateResourceInput = z.infer<typeof resourceUpdateSchema>;
export type ResourceFilterInput = z.infer<typeof resourceFilterSchema>;

export function parseResourceFormData(formData: FormData) {
  const loc = formData.get("location");
  const cap = formData.get("capacity");
  const desc = formData.get("description");
  return {
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    location: typeof loc === "string" && loc.trim() ? loc.trim() : null,
    capacity: typeof cap === "string" && cap.trim() ? Number(cap) : null,
    description: typeof desc === "string" && desc.trim() ? desc.trim() : null,
    openTime: formData.get("openTime"),
    closeTime: formData.get("closeTime"),
    isActive:
      formData.get("isActive") === "true" || formData.get("isActive") === "on",
  };
}
