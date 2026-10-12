import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session";
import { assertAdmin } from "@/lib/auth/guards";
import { authenticateUser } from "@/lib/services/auth.service";
import { ForbiddenError } from "@/lib/errors";
import { Role } from "@prisma/client";
import type { CurrentUser } from "@/lib/services/user.service";

describe("Authentication utilities", () => {
  describe("password hashing", () => {
    it("hashes and correctly verifies passwords", async () => {
      const password = "SecurePassword@123";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(await verifyPassword(password, hash)).toBe(true);
      expect(await verifyPassword("WrongPassword", hash)).toBe(false);
    });
  });

  describe("session round-trip", () => {
    it("creates a valid JWT and extracts the user id", async () => {
      const userId = "test-user-id-456";
      const token = await createSessionToken(userId);

      expect(typeof token).toBe("string");
      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(userId);
    });

    it("returns null for malformed or tampered token", async () => {
      const result = await verifySessionToken("invalid.token.signature");
      expect(result).toBeNull();
    });
  });

  describe("authorization guards", () => {
    it("throws ForbiddenError when a MEMBER tries to perform admin action", () => {
      const memberUser: CurrentUser = {
        id: "user-member",
        name: "Test Member",
        email: "member@test.com",
        role: Role.MEMBER,
        teamId: null,
      };

      expect(() => assertAdmin(memberUser)).toThrow(ForbiddenError);
    });

    it("passes assertion when user is an ADMIN", () => {
      const adminUser: CurrentUser = {
        id: "user-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: Role.ADMIN,
        teamId: null,
      };

      expect(() => assertAdmin(adminUser)).not.toThrow();
    });
  });

  describe("credential authentication with seeded accounts", () => {
    it("successfully authenticates the seeded admin user", async () => {
      const user = await authenticateUser({
        email: "admin@example.com",
        password: "Admin@123",
      });
      expect(user.email).toBe("admin@example.com");
      expect(user.role).toBe(Role.ADMIN);
    });

    it("successfully authenticates the seeded member user", async () => {
      const user = await authenticateUser({
        email: "member@example.com",
        password: "Member@123",
      });
      expect(user.email).toBe("member@example.com");
      expect(user.role).toBe(Role.MEMBER);
    });

    it("rejects invalid password with generic error message", async () => {
      await expect(
        authenticateUser({
          email: "admin@example.com",
          password: "WrongPassword@999",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("rejects nonexistent user with generic error message", async () => {
      await expect(
        authenticateUser({
          email: "unknown@example.com",
          password: "SomePassword@123",
        })
      ).rejects.toThrow("Invalid email or password");
    });
  });
});
