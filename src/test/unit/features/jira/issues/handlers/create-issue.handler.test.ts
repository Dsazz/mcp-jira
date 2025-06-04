/**
 * Create Issue Handler Tests
 * Comprehensive test suite for the CreateIssueHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { CreateIssueHandler } from "@features/jira/issues/handlers/create-issue.handler";
import type { CreateIssueParams } from "@features/jira/issues/use-cases";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("CreateIssueHandler", () => {
  let handler: CreateIssueHandler;
  let mockCreateIssueUseCase: {
    execute: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Create mock use case
    mockCreateIssueUseCase = {
      execute: mock(() => {}),
    };

    // Create handler with mock use case
    handler = new CreateIssueHandler(mockCreateIssueUseCase);
  });

  afterEach(() => {
    // Clear all mocks
    mockCreateIssueUseCase.execute.mockClear();
  });

  describe("successful issue creation", () => {
    it("should create issue with minimal required parameters", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-123",
        id: "issue-123",
        fields: {
          summary: "Test issue",
          issuetype: { name: "Task" },
          status: { name: "To Do" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("✅ Issue Created Successfully");
      expect(result.data).toContain("TEST-123");
      expect(result.data).toContain("Test issue");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should create issue with all optional parameters", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "PROJ-456",
        id: "issue-456",
        fields: {
          summary: "Complex issue with all fields",
          description: "Detailed description",
          issuetype: { name: "Bug" },
          priority: { name: "High" },
          labels: ["urgent", "frontend"],
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "PROJ",
        summary: "Complex issue with all fields",
        issueType: "Bug",
        description: "Detailed description",
        priority: "High",
        labels: ["urgent", "frontend"],
        assignee: "john.doe",
        components: ["Frontend", "API"],
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("PROJ-456");
      expect(result.data).toContain("Complex issue with all fields");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should apply bug template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "BUG-789",
        id: "bug-789",
        fields: {
          summary: "Critical bug in login",
          issuetype: { name: "Bug" },
          priority: { name: "High" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "BUG",
        summary: "Critical bug in login",
        issueType: "Bug",
        template: "bug",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("BUG-789");
      expect(result.data).toContain("Critical bug in login");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should apply story template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "STORY-101",
        id: "story-101",
        fields: {
          summary: "User can view dashboard",
          issuetype: { name: "Story" },
          priority: { name: "Medium" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "STORY",
        summary: "User can view dashboard",
        issueType: "Story",
        template: "story",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("STORY-101");
      expect(result.data).toContain("User can view dashboard");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should apply task template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TASK-202",
        id: "task-202",
        fields: {
          summary: "Update documentation",
          issuetype: { name: "Task" },
          priority: { name: "Low" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "TASK",
        summary: "Update documentation",
        issueType: "Task",
        template: "task",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TASK-202");
      expect(result.data).toContain("Update documentation");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should apply epic template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "EPIC-303",
        id: "epic-303",
        fields: {
          summary: "New user onboarding flow",
          issuetype: { name: "Epic" },
          priority: { name: "High" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "EPIC",
        summary: "New user onboarding flow",
        issueType: "Epic",
        template: "epic",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("EPIC-303");
      expect(result.data).toContain("New user onboarding flow");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should apply feature template correctly", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "FEAT-404",
        id: "feat-404",
        fields: {
          summary: "Advanced search functionality",
          issuetype: { name: "New Feature" },
          priority: { name: "Medium" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "FEAT",
        summary: "Advanced search functionality",
        issueType: "New Feature",
        template: "feature",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("FEAT-404");
      expect(result.data).toContain("Advanced search functionality");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("should handle invalid template gracefully", async () => {
      const mockCreatedIssue = mockFactory.createMockIssue({
        key: "TEST-505",
        id: "test-505",
        fields: {
          summary: "Issue without template",
          issuetype: { name: "Task" },
        },
      });

      mockCreateIssueUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockCreatedIssue),
      );

      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Issue without template",
        issueType: "Task",
        // No template provided
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST-505");
      expect(result.data).toContain("Issue without template");
      expect(mockCreateIssueUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("should handle project not found error", async () => {
      mockCreateIssueUseCase.execute.mockImplementation(() => {
        throw new JiraNotFoundError("Project", "NONEXIST");
      });

      const result = (await handler.handle({
        projectKey: "NONEXIST",
        summary: "Test issue",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Not Found");
      expect(result.error).toContain("NONEXIST");
    });

    it("should handle permission denied error", async () => {
      mockCreateIssueUseCase.execute.mockImplementation(() => {
        throw new JiraPermissionError("Insufficient permissions");
      });

      const result = (await handler.handle({
        projectKey: "RESTRICTED",
        summary: "Test issue",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
    });

    it("should handle validation errors", async () => {
      const result = (await handler.handle({
        projectKey: "", // Invalid empty project key
        summary: "Test issue",
        issueType: "Task",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    it("should handle constructor without repository", () => {
      expect(() => {
        // @ts-ignore - Intentionally passing null for test purposes
        new CreateIssueHandler(undefined);
      }).not.toThrow();
    });
  });

  describe("parameter validation", () => {
    it("should validate required parameters", async () => {
      const result = (await handler.handle({
        projectKey: "TEST",
        // Missing summary
        issueType: "Task",
      } as CreateIssueParams)) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });

    it("should validate issue type", async () => {
      const result = (await handler.handle({
        projectKey: "TEST",
        summary: "Test issue",
        issueType: "", // Invalid empty issue type
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue creation parameters");
    });
  });
});
