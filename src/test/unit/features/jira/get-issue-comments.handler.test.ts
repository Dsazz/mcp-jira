/**
 * Get Issue Comments Handler Unit Tests
 * Co-located unit tests for JIRA get issue comments MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type {
  Comment,
  CommentsResult,
  GetCommentsOptions,
} from "@features/jira/api/jira.models.types";
import { GetIssueCommentsHandler } from "@features/jira/tools/handlers/get-issue-comments.handler";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetIssueCommentsHandler", () => {
  let handler: GetIssueCommentsHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client
    mockClient = {
      getIssueComments: async (
        issueKey: string,
        _options?: GetCommentsOptions,
      ) => {
        // This will be mocked by our HTTP mocks in individual tests
        const response = await fetch(`/rest/api/3/issue/${issueKey}/comment`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        const result = (await response.json()) as CommentsResult;
        return result.comments;
      },
    };

    handler = new GetIssueCommentsHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("successful comment retrieval", () => {
    test("should format single comment correctly", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "This is a test comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 1,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/TEST-123/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("# 💬 Comments for TEST-123");
      expect(result.data).toContain("**Total:** 1 comment");
      expect(result.data).toContain("## Comment #1 • John Doe •");
      expect(result.data).toContain("This is a test comment");
    });

    test("should format multiple comments correctly", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "First comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Second comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/TEST-456/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "TEST-456",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Total:** 2 comments");
      expect(result.data).toContain("## Comment #1 • John Doe •");
      expect(result.data).toContain("First comment");
      expect(result.data).toContain("## Comment #2 • Jane Smith •");
      expect(result.data).toContain("Second comment");
    });

    test("should handle empty comments array", async () => {
      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 0,
        comments: [],
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/EMPTY-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "EMPTY-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**No comments found**");
      expect(result.data).toContain(
        "This issue doesn't have any comments yet.",
      );
    });

    test("should respect maxComments parameter", async () => {
      const mockComments: Comment[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        self: `https://test.atlassian.net/rest/api/3/issue/123/comment/${i + 1}`,
        author: {
          displayName: `User ${i + 1}`,
          accountId: `user-${i + 1}`,
        },
        body: `Comment ${i + 1}`,
        created: "2024-01-15T10:30:00.000Z",
        updated: "2024-01-15T10:30:00.000Z",
      }));

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 3,
        total: 5,
        comments: mockComments.slice(0, 3),
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/TEST-789/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "TEST-789",
        maxComments: 3,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("## Comment #3 • User 3 •");
      expect(result.data).not.toContain("## Comment #4 • User 4 •");
    });

    test("should handle orderBy parameter", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Latest updated comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-17T14:45:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "Older comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/ORDER-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "ORDER-1",
        orderBy: "updated",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Latest updated comment");
      expect(result.data).toContain("Older comment");
    });

    test("should filter by author when authorFilter provided", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
            emailAddress: "john.doe@company.com",
          },
          body: "John's comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
            emailAddress: "jane.smith@company.com",
          },
          body: "Jane's comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/FILTER-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "FILTER-1",
        authorFilter: "john",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("John's comment");
      expect(result.data).not.toContain("Jane's comment");
      expect(result.data).toContain("**Total:** 2 comments");
      expect(result.data).toContain("**Showing:** 1");
    });

    test("should filter by date range when dateRange provided", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "Old comment",
          created: "2024-01-01T10:30:00.000Z",
          updated: "2024-01-01T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Recent comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/DATE-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "DATE-1",
        dateRange: {
          from: "2024-01-15T00:00:00.000Z",
          to: "2024-01-17T23:59:59.000Z",
        },
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Recent comment");
      expect(result.data).not.toContain("Old comment");
    });

    test("should filter internal comments when includeInternal is false", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "Public comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Internal comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
          visibility: {
            type: "role",
            value: "Developers",
          },
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/INTERNAL-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "INTERNAL-1",
        includeInternal: false,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Public comment");
      expect(result.data).not.toContain("Internal comment");
    });

    test("should include internal comments when includeInternal is true", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
          },
          body: "Public comment",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Internal comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
          jsdPublic: false,
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/INTERNAL-2/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "INTERNAL-2",
        includeInternal: true,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Public comment");
      expect(result.data).toContain("Internal comment");
      expect(result.data).toContain("🔒 Comment #2");
    });
  });

  describe("parameter validation", () => {
    test("should reject invalid issue key format", async () => {
      const result = await handler.handle({ issueKey: "invalid-key" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
      expect(result.error).toContain(
        "Issue key must be in the format PROJECT-123",
      );
    });

    test("should reject maxComments out of range", async () => {
      const result = await handler.handle({
        issueKey: "TEST-123",
        maxComments: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
    });

    test("should reject maxComments too high", async () => {
      const result = await handler.handle({
        issueKey: "TEST-123",
        maxComments: 101,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
    });

    test("should reject invalid orderBy value", async () => {
      const result = await handler.handle({
        issueKey: "TEST-123",
        orderBy: "invalid" as "created" | "updated",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
    });

    test("should reject empty authorFilter", async () => {
      const result = await handler.handle({
        issueKey: "TEST-123",
        authorFilter: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
    });

    test("should reject invalid date format in dateRange", async () => {
      const result = await handler.handle({
        issueKey: "TEST-123",
        dateRange: {
          from: "invalid-date",
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid comment parameters");
    });
  });

  describe("error handling", () => {
    test("should handle issue not found error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/NONEXIST-1/comment",
        404,
        "Issue not found",
      );

      const result = await handler.handle({ issueKey: "NONEXIST-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 404");
    });

    test("should handle authentication error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/TEST-1/comment",
        401,
        "Authentication failed",
      );

      const result = await handler.handle({ issueKey: "TEST-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 401");
    });

    test("should handle permission error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/RESTRICT-1/comment",
        403,
        "Forbidden",
      );

      const result = await handler.handle({ issueKey: "RESTRICT-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP 403");
    });

    test("should handle network error", async () => {
      mockHttp.mockNetworkError("/rest/api/3/issue/NETWORK-1/comment");

      const result = await handler.handle({ issueKey: "NETWORK-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle missing client error", async () => {
      const handlerWithoutClient = new GetIssueCommentsHandler();

      const result = await handlerWithoutClient.handle({
        issueKey: "TEST-123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA client not initialized");
    });

    test("should handle malformed response gracefully", async () => {
      // Mock the client to simulate malformed API response processing
      const malformedClient: Partial<JiraClient> = {
        getIssueComments: async () => {
          // Simulate what happens when API returns malformed data
          // The client would try to parse this and should throw an error
          throw new Error(
            "Failed to parse API response: comments property is not an array",
          );
        },
      };

      const handlerWithMalformedClient = new GetIssueCommentsHandler(
        malformedClient as JiraClient,
      );

      const result = await handlerWithMalformedClient.handle({
        issueKey: "MALFORM-1",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to parse API response");
    });
  });

  describe("advanced filtering edge cases", () => {
    test("should handle combined filters correctly", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
            emailAddress: "john.doe@company.com",
          },
          body: "John's recent comment",
          created: "2024-01-16T10:30:00.000Z",
          updated: "2024-01-16T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
            emailAddress: "john.doe@company.com",
          },
          body: "John's old comment",
          created: "2024-01-01T10:30:00.000Z",
          updated: "2024-01-01T10:30:00.000Z",
        },
        {
          id: "3",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/3",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
          },
          body: "Jane's recent comment",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 3,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/COMBINED-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "COMBINED-1",
        authorFilter: "john",
        dateRange: {
          from: "2024-01-15T00:00:00.000Z",
        },
        maxComments: 1,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("John's recent comment");
      expect(result.data).not.toContain("John's old comment");
      expect(result.data).not.toContain("Jane's recent comment");
      expect(result.data).toContain("**Showing:** 1");
    });

    test("should handle email-based author filtering", async () => {
      const mockComments: Comment[] = [
        {
          id: "1",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/1",
          author: {
            displayName: "John Doe",
            accountId: "user-123",
            emailAddress: "john.doe@company.com",
          },
          body: "Comment by john.doe",
          created: "2024-01-15T10:30:00.000Z",
          updated: "2024-01-15T10:30:00.000Z",
        },
        {
          id: "2",
          self: "https://test.atlassian.net/rest/api/3/issue/123/comment/2",
          author: {
            displayName: "Jane Smith",
            accountId: "user-456",
            emailAddress: "jane.smith@company.com",
          },
          body: "Comment by jane.smith",
          created: "2024-01-16T14:45:00.000Z",
          updated: "2024-01-16T14:45:00.000Z",
        },
      ];

      const mockResponse: CommentsResult = {
        startAt: 0,
        maxResults: 10,
        total: 2,
        comments: mockComments,
      };

      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/issue/EMAIL-1/comment",
        mockResponse,
      );

      const result = (await handler.handle({
        issueKey: "EMAIL-1",
        authorFilter: "john.doe@company",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Comment by john.doe");
      expect(result.data).not.toContain("Comment by jane.smith");
    });
  });
});
