import { describe, expect, it } from "vitest";
import { env } from "@/lib/env";

describe("env configuration", () => {
  it("loads validated environment variables", () => {
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.SESSION_SECRET).toBeDefined();
    expect(env.NEXT_PUBLIC_ORG_TIMEZONE).toBe("Asia/Karachi");
  });
});
