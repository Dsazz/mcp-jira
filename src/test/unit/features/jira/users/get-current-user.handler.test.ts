/**
 * GetCurrentUserHandler Unit Tests
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { GetCurrentUserHandler } from "@features/jira/users/handlers/get-current-user.handler";
import type { GetCurrentUserUseCase } from "@features/jira/users/use-cases/user-profile.use-cases";
import {
  mockAdminUser,
  mockInactiveUser,
  mockUser,
  userMockFactory,
} from "@test/mocks/users/user-profile.mock";
import { jiraApiMocks } from "@test/utils/mock-helpers";

describe("GetCurrentUserHandler", () => {
  let handler: GetCurrentUserHandler;
  let mockUseCase: GetCurrentUserUseCase;

  beforeEach(() => {
    // Create mock use case
    mockUseCase = {
      execute: async () => ({ user: mockUser }),
    };

    handler = new GetCurrentUserHandler(mockUseCase);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("handle", () => {
    test("should successfully get current user profile", async () => {
      const result = await handler.handle({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle admin user profile", async () => {
      mockUseCase.execute = async () => ({ user: mockAdminUser });

      const result = await handler.handle({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle inactive user profile", async () => {
      mockUseCase.execute = async () => ({ user: mockInactiveUser });

      const result = await handler.handle({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle user with different timezone", async () => {
      const europeanUser =
        userMockFactory.createUserWithTimezone("Europe/London");
      mockUseCase.execute = async () => ({ user: europeanUser });

      const result = await handler.handle({});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle authentication errors", async () => {
      mockUseCase.execute = async () => {
        throw new Error("Authentication failed");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication failed");
    });

    test("should handle permission denied errors", async () => {
      mockUseCase.execute = async () => {
        throw new Error("Forbidden - insufficient permissions");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Forbidden - insufficient permissions");
    });

    test("should handle network errors", async () => {
      mockUseCase.execute = async () => {
        throw new Error("Network error");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle malformed response errors", async () => {
      mockUseCase.execute = async () => {
        throw new Error("Invalid response format");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid response format");
    });

    test("should handle null parameters gracefully", async () => {
      const result = await handler.handle(null);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle undefined parameters gracefully", async () => {
      const result = await handler.handle(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
