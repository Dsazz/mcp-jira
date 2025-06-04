/**
 * Update Issue Handler Tests
 * Comprehensive test suite for the UpdateIssueHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { UpdateIssueHandler } from "@features/jira/issues/tools/update-issue.handler";
import { setupTests } from "@test/utils/test-setup";
import { mockFactory } from "@test/mocks/jira-mock-factory";

// Setup test environment
setupTests();

describe("UpdateIssueHandler", () => {
  let handler: UpdateIssueHandler;
  let mockUpdateIssueUseCase: {
    execute: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Create mock use case
    mockUpdateIssueUseCase = {
      execute: mock(() => {}),
    };

    // Create handler with mock use case
    handler = new UpdateIssueHandler(mockUpdateIssueUseCase);
  });

  afterEach(() => {
    // Clear all mocks
    mockUpdateIssueUseCase.execute.mockClear();
  });

  describe("successful issue updates", () => {
    it("should update issue with basic fields", async () => {
      const mockUpdatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        id: "issue-123",
        fields: {
          summary: "Updated test issue",
          description: "Updated description",
        },
      });

      mockUpdateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockUpdatedIssue),
      );

      const result = (await handler.handle({
        issueKey: "TEST-123",
        summary: "Updated test issue",
        description: "Updated description",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("✅ Issue Updated Successfully");
      expect(result.data).toContain("TEST-123");
      expect(mockUpdateIssueUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockUpdateIssueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "TEST-123",
          fields: expect.objectContaining({
            summary: "Updated test issue",
            description: "Updated description",
          }),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle issue not found error", async () => {
      mockUpdateIssueUseCase.execute.mockImplementation(() => {
        throw new JiraNotFoundError("Issue", "NONEXIST-123");
      });

      const result = await handler.handle({
        issueKey: "NONEXIST-123",
        summary: "Updated summary",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Issue Not Found");
    });

    it("should handle permission denied error", async () => {
      mockUpdateIssueUseCase.execute.mockImplementation(() => {
        throw new JiraPermissionError("Insufficient permissions");
      });

      const result = await handler.handle({
        issueKey: "RESTRICTED-123",
        summary: "Updated summary",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
    });

    it("should handle validation errors", async () => {
      mockUpdateIssueUseCase.execute.mockImplementation(() => {
        throw JiraApiError.withStatusCode("Invalid issue update parameters", 400);
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        // Include an invalid parameter format
        priority: "invalid-format" as unknown as Record<string, string>,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Update Failed");
    });

    it("should handle constructor without use case", () => {
      expect(() => {
        // @ts-ignore - Intentionally creating with invalid params for test
        new UpdateIssueHandler();
      }).not.toThrow();
    });
  });

  describe("parameter validation", () => {
    it("should validate required issue key", async () => {
      const result = await handler.handle({
        // @ts-ignore - Intentionally omitting required field for test
        issueKey: undefined,
        summary: "Updated summary",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });

    it("should validate issue key format", async () => {
      const result = await handler.handle({
        issueKey: "invalid-format", // Invalid format
        summary: "Updated summary",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });

    it("should handle empty issue key", async () => {
      const result = await handler.handle({
        issueKey: "", // Empty string
        summary: "Updated summary",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });
  });
});
