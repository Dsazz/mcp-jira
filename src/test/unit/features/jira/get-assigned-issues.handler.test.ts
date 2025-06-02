/**
 * Get Assigned Issues Handler Unit Tests
 * Co-located unit tests for JIRA get assigned issues MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { GetAssignedIssuesHandler } from "@features/jira/tools/handlers/get-assigned-issues.handler";
import { jiraApiMocks, testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetAssignedIssuesHandler", () => {
  let handler: GetAssignedIssuesHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client
    mockClient = {
      getAssignedIssues: async (fields?: string[]) => {
        // This will be mocked by jiraApiMocks in individual tests
        const response = await fetch("/rest/api/3/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jql: "assignee = currentUser() ORDER BY updated DESC",
            fields,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        const searchResult = await response.json();
        // Extract issues array from search result, just like the real client
        return searchResult.issues || [];
      },
    };

    handler = new GetAssignedIssuesHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("successful retrieval", () => {
    test("should retrieve and format assigned issues", async () => {
      const mockResults = {
        issues: [
          testDataBuilder.issueWithStatus("In Progress", "yellow"),
          testDataBuilder.issueWithStatus("To Do", "blue"),
        ],
        total: 2,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("# Your Assigned Issues");
      expect(result.data).toContain("2 issue(s) assigned to you");
      expect(result.data).toContain(
        "| Key | Summary | Status | Priority | Updated |",
      );
    });

    test("should handle single assigned issue", async () => {
      const mockIssue = testDataBuilder.issueWithStatus(
        "In Progress",
        "yellow",
      );
      mockIssue.key = "SINGLE-1";
      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue(s) assigned to you");
      expect(result.data).toContain("SINGLE-1");
      expect(result.data).toContain("In Progress");
    });

    test("should handle multiple assigned issues", async () => {
      const mockResults = {
        issues: [
          testDataBuilder.issueWithStatus("To Do", "blue"),
          testDataBuilder.issueWithStatus("In Progress", "yellow"),
          testDataBuilder.issueWithStatus("Done", "green"),
        ],
        total: 3,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("3 issue(s) assigned to you");
      expect(result.data).toContain("To Do");
      expect(result.data).toContain("In Progress");
      expect(result.data).toContain("Done");
    });

    test("should include issue details in table format", async () => {
      const mockIssue = testDataBuilder.issueWithStatus(
        "In Progress",
        "yellow",
      );
      mockIssue.key = "DETAIL-123";
      mockIssue.fields = {
        ...mockIssue.fields,
        summary: "Test issue summary",
        priority: { name: "High" },
        updated: "2025-01-01T12:00:00.000Z",
      };

      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("DETAIL-123");
      expect(result.data).toContain("Test issue summary");
      expect(result.data).toContain("In Progress");
      expect(result.data).toContain("High");
      expect(result.data).toContain("1/1/2025");
    });

    test("should handle issues with missing optional fields", async () => {
      const minimalIssue = {
        id: "minimal",
        key: "MIN-1",
        self: "https://test.atlassian.net/rest/api/3/issue/minimal",
        fields: {
          summary: "Minimal issue",
          // Missing status, priority, updated
        },
      };

      const mockResults = {
        issues: [minimalIssue],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MIN-1");
      expect(result.data).toContain("Minimal issue");
      expect(result.data).toContain("Unknown"); // Default status
      expect(result.data).toContain("None"); // Default priority
      expect(result.data).toContain("N/A"); // Default updated
    });
  });

  describe("empty results handling", () => {
    test("should handle no assigned issues", async () => {
      const mockResults = {
        issues: [],
        total: 0,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toBe("No issues are currently assigned to you.");
    });

    test("should handle empty issues array gracefully", async () => {
      const mockResults = {
        issues: [],
        total: 0,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toBe("No issues are currently assigned to you.");
    });
  });

  describe("error handling", () => {
    test("should handle authentication error", async () => {
      jiraApiMocks.mockAuthError();

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 401");
    });

    test("should handle permission error", async () => {
      jiraApiMocks.mockPermissionError("/rest/api/3/search");

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 403");
    });

    test("should handle network error", async () => {
      jiraApiMocks.mockNetworkError("/rest/api/3/search");

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle JIRA API error", async () => {
      const fetchMock = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () =>
            Promise.resolve({
              errorMessages: ["Internal server error"],
              errors: {},
            }),
          text: () =>
            Promise.resolve(
              JSON.stringify({
                errorMessages: ["Internal server error"],
                errors: {},
              }),
            ),
        }),
      );

      (global as { fetch: unknown }).fetch = fetchMock;

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 500");
    });

    test("should handle malformed response", async () => {
      const fetchMock = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              // Missing issues array
              invalidStructure: true,
            }),
        }),
      );

      (global as { fetch: unknown }).fetch = fetchMock;

      const result = (await handler.handle({})) as McpResponse<string>;

      // Should handle gracefully and return empty message
      expect(result.success).toBe(true);
      expect(result.data).toBe("No issues are currently assigned to you.");
    });

    test("should handle client not initialized", async () => {
      const handlerWithoutClient = new GetAssignedIssuesHandler();

      const result = await handlerWithoutClient.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA client not initialized");
    });
  });

  describe("parameter handling", () => {
    test("should accept empty parameters object", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue(s) assigned to you");
    });

    test("should ignore any provided parameters", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        // These should be ignored
        project: "TEST",
        status: "Done",
        randomParam: "ignored",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("1 issue(s) assigned to you");
    });
  });

  describe("formatting and display", () => {
    test("should format table headers correctly", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        "| Key | Summary | Status | Priority | Updated |",
      );
      expect(result.data).toContain(
        "| --- | ------- | ------ | -------- | ------- |",
      );
    });

    test("should format dates correctly", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.fields = {
        ...mockIssue.fields,
        updated: "2025-01-15T14:30:00.000Z",
      };

      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      // Date should be formatted as locale date string
      expect(result.data).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test("should escape markdown special characters in issue data", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.key = "ESCAPE-1";
      mockIssue.fields = {
        ...mockIssue.fields,
        summary: "Issue with | pipe and * asterisk characters",
      };

      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("ESCAPE-1");
      expect(result.data).toContain(
        "Issue with | pipe and * asterisk characters",
      );
    });
  });
});
