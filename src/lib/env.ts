import { z } from "zod";

if (typeof window === "undefined" && !process.env.DATABASE_URL) {
  try {
    process.loadEnvFile?.();
  } catch {
    // .env file is optional if env vars are provided in process.env
  }
}

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_ORG_TIMEZONE: z.string().min(1).default("Asia/Karachi"),
});

const isServer = typeof window === "undefined";

const serverParsed = isServer
  ? serverEnvSchema.safeParse(process.env)
  : {
      success: true as const,
      data: {} as Partial<z.infer<typeof serverEnvSchema>>,
    };

if (!serverParsed.success) {
  console.error(
    "Invalid server environment variables:",
    serverParsed.error.format()
  );
  throw new Error("Invalid server environment variables");
}

const clientParsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_ORG_TIMEZONE: process.env.NEXT_PUBLIC_ORG_TIMEZONE,
});

if (!clientParsed.success) {
  console.error(
    "Invalid client environment variables:",
    clientParsed.error.format()
  );
  throw new Error("Invalid client environment variables");
}

export const env = {
  ...serverParsed.data,
  ...clientParsed.data,
};
