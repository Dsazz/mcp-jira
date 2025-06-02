/**
 * Search Issues Handler Unit Tests
 * Co-located unit tests for JIRA search issues MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { SearchIssuesHandler } from "@features/jira/tools/handlers/search-issues.handler";
import { jiraApiMocks, testDataBuilder } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("SearchIssuesHandler", () => {
  let handler: SearchIssuesHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client
    mockClient = {
      searchIssues: async (
        jql: string,
        fields?: string[],
        maxResults?: number,
      ) => {
        // This will be mocked by jiraApiMocks in individual tests
        const response = await fetch("/rest/api/3/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jql, maxResults, fields }),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        const searchResult = await response.json();
        // Extract issues array from search result, just like the real client
        return searchResult.issues || [];
      },
    };

    handler = new SearchIssuesHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("JQL query building", () => {
    test("should use direct JQL when provided", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        jql: 'project = "TEST" AND status = "To Do"',
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
    });

    test("should build JQL from assignedToMe parameter", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("In Progress", "yellow")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        assignedToMe: true,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
    });

    test("should build JQL from project parameter", async () => {
      const mockResults = {
        issues: [
          testDataBuilder.issueWithStatus("To Do", "blue"),
          testDataBuilder.issueWithStatus("Done", "green"),
        ],
        total: 2,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "MYPROJECT",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 2");
    });

    test("should build JQL from status parameter (single)", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("Done", "green")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        status: "Done",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
      expect(result.data).toContain("Done");
    });

    test("should build JQL from status parameter (array)", async () => {
      const mockResults = {
        issues: [
          testDataBuilder.issueWithStatus("To Do", "blue"),
          testDataBuilder.issueWithStatus("In Progress", "yellow"),
        ],
        total: 2,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        status: ["To Do", "In Progress"],
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 2");
    });

    test("should build JQL from text parameter", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        text: "bug fix",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
    });

    test("should combine multiple helper parameters", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("In Progress", "yellow")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        assignedToMe: true,
        project: "TEST",
        status: "In Progress",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
    });
  });

  describe("search results handling", () => {
    test("should handle empty search results", async () => {
      const mockResults = {
        issues: [],
        total: 0,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "EMPTY",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        "No issues found matching your search criteria",
      );
    });

    test("should handle single search result", async () => {
      const mockIssue = testDataBuilder.issueWithStatus("To Do", "blue");
      mockIssue.key = "SINGLE-1";
      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "SINGLE",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 1");
      expect(result.data).toContain("SINGLE-1");
    });

    test("should handle multiple search results", async () => {
      jiraApiMocks.mockSearchIssues("mixed-issues");

      const result = (await handler.handle({
        project: "MIXED",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 5");
      expect(result.data).toContain("🎫");
    });

    test("should respect maxResults parameter", async () => {
      const mockResults = {
        issues: Array.from({ length: 5 }, (_, i) => {
          const issue = testDataBuilder.issueWithStatus("To Do", "blue");
          issue.key = `LIMIT-${i + 1}`;
          return issue;
        }),
        total: 100,
        maxResults: 5,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "LIMIT",
        maxResults: 5,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 5");
      expect(result.data).toContain("Showing first 5");
    });

    test("should handle large result sets with pagination info", async () => {
      jiraApiMocks.mockSearchIssues("large-result-set");

      const result = (await handler.handle({
        project: "LARGE",
        maxResults: 25, // This should equal the number of issues returned to trigger pagination
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 25");
      expect(result.data).toContain("Showing first");
    });
  });

  describe("error handling", () => {
    test("should handle authentication error", async () => {
      jiraApiMocks.mockAuthError();

      const result = await handler.handle({
        project: "TEST",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 401");
    });

    test("should handle permission error", async () => {
      jiraApiMocks.mockPermissionError("/rest/api/3/search");

      const result = await handler.handle({
        project: "RESTRICTED",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 403");
    });

    test("should handle network error", async () => {
      jiraApiMocks.mockNetworkError("/rest/api/3/search");

      const result = await handler.handle({
        project: "NETWORK",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle invalid JQL error", async () => {
      // Mock a 400 error for invalid JQL
      const fetchMock = mock(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              errorMessages: ["Invalid JQL query"],
              errors: {},
            }),
          text: () =>
            Promise.resolve(
              JSON.stringify({
                errorMessages: ["Invalid JQL query"],
                errors: {},
              }),
            ),
        }),
      );

      (global as { fetch: unknown }).fetch = fetchMock;

      const result = await handler.handle({
        jql: "invalid jql syntax here",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 400");
    });

    test("should handle malformed search response", async () => {
      // Mock a response that will cause the mock client to throw an error
      const fetchMock = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              // Missing issues array - this will cause searchResult.issues to be undefined
              // and when we try to return searchResult.issues || [], it will return []
              // but the handler will try to access properties that don't exist
              invalidStructure: true,
            }),
        }),
      );

      (global as { fetch: unknown }).fetch = fetchMock;

      const result = (await handler.handle({
        project: "MALFORMED",
      })) as McpResponse<string>;

      // Since the mock returns undefined for issues, it gets converted to []
      // which is handled gracefully, so this test should actually expect success
      expect(result.success).toBe(true);
      expect(result.data).toContain(
        "No issues found matching your search criteria",
      );
    });
  });

  describe("input validation", () => {
    test("should require at least one search parameter", async () => {
      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid search parameters");
    });

    test("should handle empty string parameters", async () => {
      const result = await handler.handle({
        project: "",
        text: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid search parameters");
    });

    test("should validate maxResults bounds", async () => {
      const result = await handler.handle({
        project: "TEST",
        maxResults: 100, // Over the limit
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid search parameters");
    });

    test("should validate maxResults minimum", async () => {
      const result = await handler.handle({
        project: "TEST",
        maxResults: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid search parameters");
    });

    test("should accept valid maxResults", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 10,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = await handler.handle({
        project: "TEST",
        maxResults: 10,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("formatting and display", () => {
    test("should format search results properly", async () => {
      const mockResults = {
        issues: [
          testDataBuilder.issueWithStatus("To Do", "blue"),
          testDataBuilder.issueWithStatus("Done", "green"),
        ],
        total: 2,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "FORMAT",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      // Check for proper markdown structure
      expect(result.data).toMatch(/^# /); // Should start with header
      expect(result.data).toContain("**Results**: 2");
      expect(result.data).toContain("##"); // Should have issue headers
    });

    test("should include issue summaries and statuses", async () => {
      const mockIssue = testDataBuilder.issueWithStatus(
        "In Progress",
        "yellow",
      );
      mockIssue.key = "DETAIL-1";
      mockIssue.fields = {
        ...mockIssue.fields,
        summary: "Test issue summary",
      };

      const mockResults = {
        issues: [mockIssue],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "DETAIL",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("DETAIL-1");
      expect(result.data).toContain("Test issue summary");
      expect(result.data).toContain("In Progress");
    });

    test("should handle issues with missing optional fields", async () => {
      const minimalIssue = {
        id: "minimal",
        key: "MIN-1",
        self: "https://test.atlassian.net/rest/api/3/issue/minimal",
        fields: {
          summary: "Minimal issue",
          // Missing status, priority, etc.
        },
      };

      const mockResults = {
        issues: [minimalIssue],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "MINIMAL",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MIN-1");
      expect(result.data).toContain("Minimal issue");
    });

    test("should show pagination information for large results", async () => {
      const mockResults = {
        issues: Array.from({ length: 25 }, (_, i) => {
          const issue = testDataBuilder.issueWithStatus("To Do", "blue");
          issue.key = `PAGE-${i + 1}`;
          return issue;
        }),
        total: 150,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = (await handler.handle({
        project: "PAGE",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Results**: 25");
      expect(result.data).toContain("Showing first 25");
    });
  });

  describe("fields parameter handling", () => {
    test("should handle custom fields parameter", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = await handler.handle({
        project: "FIELDS",
        fields: ["summary", "status", "assignee"],
      });

      expect(result.success).toBe(true);
    });

    test("should handle empty fields array", async () => {
      const mockResults = {
        issues: [testDataBuilder.issueWithStatus("To Do", "blue")],
        total: 1,
        maxResults: 25,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/search", mockResults);

      const result = await handler.handle({
        project: "EMPTY_FIELDS",
        fields: [],
      });

      expect(result.success).toBe(true);
    });
  });
});
