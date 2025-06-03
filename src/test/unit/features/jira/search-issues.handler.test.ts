/**
 * Search Issues Handler Unit Tests
 * Co-located unit tests for JIRA search issues MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraApiError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { jiraApiMocks, testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("SearchIssuesHandler", () => {
  let handler: SearchIssuesHandler;
  let mockSearchIssuesUseCase: {
    execute: ReturnType<typeof mock>;
  };

  beforeEach(() => {
    // Create a mock use case
    mockSearchIssuesUseCase = {
      execute: mock(() => {}),
    };

    // Create handler with mock use case
    handler = new SearchIssuesHandler(mockSearchIssuesUseCase);
  });

  afterEach(() => {
    mockSearchIssuesUseCase.execute.mockClear();
    jiraApiMocks.clearMocks();
  });

  describe("Use case delegation", () => {
    test("should delegate to use case with direct JQL when provided", async () => {
      const mockResults = [testDataBuilder.issueWithStatus("To Do", "blue")];
      const expectedJql = 'project = "TEST" AND status = "To Do"';

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        jql: expectedJql,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");

      // Verify use case was called with the right parameters
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          jql: expectedJql,
        }),
      );
    });

    test("should delegate to use case with assignedToMe parameter", async () => {
      const mockResults = [
        testDataBuilder.issueWithStatus("In Progress", "yellow"),
      ];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        assignedToMe: true,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");

      // Verify use case was called with assignedToMe parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedToMe: true,
        }),
      );
    });

    test("should delegate to use case with project parameter", async () => {
      const mockResults = [
        testDataBuilder.issueWithStatus("To Do", "blue"),
        testDataBuilder.issueWithStatus("Done", "green"),
      ];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        project: "MYPROJECT",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("2 issues assigned to you");

      // Verify use case was called with project parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          project: "MYPROJECT",
        }),
      );
    });

    test("should delegate to use case with status parameter (single)", async () => {
      const mockResults = [testDataBuilder.issueWithStatus("Done", "green")];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        status: "Done",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");
      expect(result.data).toContain("Done");

      // Verify use case was called with status parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "Done",
        }),
      );
    });

    test("should delegate to use case with status parameter (array)", async () => {
      const mockResults = [
        testDataBuilder.issueWithStatus("To Do", "blue"),
        testDataBuilder.issueWithStatus("In Progress", "yellow"),
      ];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        status: ["To Do", "In Progress"],
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("2 issues assigned to you");

      // Verify use case was called with status array parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ["To Do", "In Progress"],
        }),
      );
    });

    test("should delegate to use case with text parameter", async () => {
      const mockResults = [testDataBuilder.issueWithStatus("To Do", "blue")];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        text: "bug fix",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");

      // Verify use case was called with text parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "bug fix",
        }),
      );
    });

    test("should delegate to use case with multiple parameters", async () => {
      const mockResults = [
        testDataBuilder.issueWithStatus("In Progress", "yellow"),
      ];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockResults),
      );

      const result = (await handler.handle({
        assignedToMe: true,
        project: "TEST",
        status: "In Progress",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");

      // Verify use case was called with all parameters
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedToMe: true,
          project: "TEST",
          status: "In Progress",
        }),
      );
    });
  });

  describe("search results handling", () => {
    test("should handle empty search results", async () => {
      // Setup mock use case to return empty array
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve([]),
      );

      const result = (await handler.handle({
        project: "EMPTY",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("0 issues assigned to you");
    });

    test("should handle single search result", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.key = "SINGLE-1";

      // Setup mock use case to return single issue
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve([mockIssue]),
      );

      const result = (await handler.handle({
        project: "SINGLE",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");
      expect(result.data).toContain("SINGLE-1");
    });

    test("should handle multiple search results", async () => {
      const mockIssues = [
        testDataBuilder.issueWithStatus("To Do", "blue"),
        testDataBuilder.issueWithStatus("In Progress", "yellow"),
        testDataBuilder.issueWithStatus("In Review", "orange"),
        testDataBuilder.issueWithStatus("Done", "green"),
        testDataBuilder.issueWithStatus("Blocked", "red"),
      ];

      // Setup mock use case to return multiple issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockIssues),
      );

      const result = (await handler.handle({
        project: "MIXED",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("5 issues assigned to you");
    });

    test("should respect maxResults parameter", async () => {
      const mockIssues = Array.from({ length: 5 }, (_, i) => {
        const issue = testDataBuilder.issueWithStatus("To Do", "blue");
        issue.key = `LIMIT-${i + 1}`;
        return issue;
      });

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockIssues),
      );

      const result = (await handler.handle({
        project: "LIMIT",
        maxResults: 5,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("5 issues assigned to you");

      // Verify use case was called with maxResults parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          maxResults: 5,
        }),
      );
    });

    test("should pass fields parameter to use case", async () => {
      const mockIssues = [testDataBuilder.issueWithStatus("Done", "green")];
      const fields = ["summary", "status", "assignee"];

      // Setup mock use case to return issues
      mockSearchIssuesUseCase.execute.mockImplementation(() =>
        Promise.resolve(mockIssues),
      );

      const result = (await handler.handle({
        project: "FIELDS",
        fields,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue assigned to you");

      // Verify use case was called with fields parameter
      expect(mockSearchIssuesUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          fields,
        }),
      );
    });
  });

  describe("error handling", () => {
    test("should handle JQL parse errors", async () => {
      // Setup mock use case to throw error
      mockSearchIssuesUseCase.execute.mockImplementation(() => {
        throw JiraApiError.withStatusCode("JQL parse error: Empty JQL query", 400);
      });

      const result = (await handler.handle({
        jql: "", // Invalid empty JQL
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      // Don't expect a specific error message since the validation may happen before the use case
    });

    test("should handle permission errors", async () => {
      // Setup mock use case to throw permission error
      mockSearchIssuesUseCase.execute.mockImplementation(() => {
        throw new JiraPermissionError(
          "You do not have permission to search this project",
        );
      });

      const result = (await handler.handle({
        project: "RESTRICTED",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
    });

    test("should handle validation errors", async () => {
      const result = (await handler.handle({
        maxResults: -5, // Invalid negative maxResults
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid search parameters");
    });

    test("should handle unknown errors", async () => {
      // Setup mock use case to throw unknown error
      mockSearchIssuesUseCase.execute.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const result = (await handler.handle({
        project: "ERROR",
      })) as McpResponse<string>;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Search Failed");
    });
  });
});
