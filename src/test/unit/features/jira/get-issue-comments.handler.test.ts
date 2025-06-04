/**
 * Get Issue Comments Handler Tests
 * Comprehensive test suite for the GetIssueCommentsHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import type { Comment } from "@features/jira/issues/models/comment.models";
import { GetIssueCommentsHandler } from "@features/jira/issues/tools/get-issue-comments.handler";
import type { GetIssueCommentsUseCase } from "@features/jira/issues/use-cases";
import type { IssueCommentValidator } from "@features/jira/issues/validators";
import { jiraApiMocks } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetIssueCommentsHandler", () => {
  // Mock dependencies
  let mockUseCase: GetIssueCommentsUseCase;
  let mockValidator: IssueCommentValidator;
  let handler: GetIssueCommentsHandler;

  // Mock comments
  const mockComments: Comment[] = [
    {
      id: "1",
      self: "https://jira.example.com/rest/api/2/comment/1",
      author: {
        accountId: "user1",
        displayName: "Test User",
        emailAddress: "test@example.com",
      },
      body: "Test comment 1",
      created: "2023-01-01T10:00:00.000Z",
      updated: "2023-01-01T10:00:00.000Z",
    },
    {
      id: "2",
      self: "https://jira.example.com/rest/api/2/comment/2",
      author: {
        accountId: "user2",
        displayName: "Another User",
        emailAddress: "another@example.com",
      },
      body: "Test comment 2",
      created: "2023-01-02T10:00:00.000Z",
      updated: "2023-01-02T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    // Create mocks
    mockUseCase = {
      execute: mock(() => Promise.resolve(mockComments)),
    };

    mockValidator = {
      validateGetCommentsParams: mock((params) => params),
    };

    // Create handler with mocks
    handler = new GetIssueCommentsHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
    mock.restore();
  });

  describe("successful comment retrieval", () => {
    it("should format single comment correctly", async () => {
      const singleComment: Comment[] = [
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

      // Setup mock use case to return a single comment
      mockUseCase.execute = mock(() => Promise.resolve(singleComment));

      const result = (await handler.handle({
        issueKey: "TEST-123",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("# 💬 Comments for TEST-123");
      expect(result.data).toContain("**Total:** 1 comment");
      expect(result.data).toContain("John Doe");
      expect(result.data).toContain("This is a test comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "TEST-123",
        }),
      );

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
    });

    it("should format multiple comments correctly", async () => {
      const multipleComments: Comment[] = [
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

      // Setup mock use case to return multiple comments
      mockUseCase.execute = mock(() => Promise.resolve(multipleComments));

      const result = (await handler.handle({
        issueKey: "TEST-456",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**Total:** 2 comments");
      expect(result.data).toContain("John Doe");
      expect(result.data).toContain("First comment");
      expect(result.data).toContain("Jane Smith");
      expect(result.data).toContain("Second comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "TEST-456",
        }),
      );
    });

    it("should handle empty comments array", async () => {
      const emptyComments: Comment[] = [];

      // Setup mock use case to return empty comments array
      mockUseCase.execute = mock(() => Promise.resolve(emptyComments));

      const result = (await handler.handle({
        issueKey: "EMPTY-1",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("**No comments found**");
      expect(result.data).toContain("This issue doesn't have any comments yet");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "EMPTY-1",
        }),
      );
    });

    it("should respect maxComments parameter", async () => {
      const manyComments: Comment[] = Array.from({ length: 5 }, (_, i) => ({
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

      // Setup mock use case to return limited comments
      mockUseCase.execute = mock(() =>
        Promise.resolve(manyComments.slice(0, 3)),
      );

      const result = (await handler.handle({
        issueKey: "TEST-789",
        maxComments: 3,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("## Comment #3 •");
      expect(result.data).not.toContain("## Comment #4 •");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "TEST-789",
          maxComments: 3,
        }),
      );
    });

    it("should handle orderBy parameter", async () => {
      const orderedComments: Comment[] = [
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

      // Setup mock use case to return ordered comments
      mockUseCase.execute = mock(() => Promise.resolve(orderedComments));

      const result = (await handler.handle({
        issueKey: "ORDER-1",
        orderBy: "updated",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Latest updated comment");
      expect(result.data).toContain("Older comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "ORDER-1",
          orderBy: "updated",
        }),
      );
    });

    it("should filter by author when authorFilter provided", async () => {
      const filteredComments: Comment[] = [
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
      ];

      // Setup mock use case to return filtered comments
      mockUseCase.execute = mock(() => Promise.resolve(filteredComments));

      const result = (await handler.handle({
        issueKey: "FILTER-1",
        authorFilter: "john",
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("John's comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "FILTER-1",
          authorFilter: "john",
        }),
      );
    });

    it("should filter by date range when dateRange provided", async () => {
      const recentComments: Comment[] = [
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

      // Setup mock use case to return date-filtered comments
      mockUseCase.execute = mock(() => Promise.resolve(recentComments));

      const dateRange = {
        from: "2024-01-15T00:00:00.000Z",
        to: "2024-01-17T23:59:59.000Z",
      };

      const result = (await handler.handle({
        issueKey: "DATE-1",
        dateRange,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Recent comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "DATE-1",
          dateRange,
        }),
      );
    });

    it("should filter internal comments when includeInternal is false", async () => {
      const publicComments: Comment[] = [
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
      ];

      // Setup mock use case to return public comments only
      mockUseCase.execute = mock(() => Promise.resolve(publicComments));

      const result = (await handler.handle({
        issueKey: "INTERNAL-1",
        includeInternal: false,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Public comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "INTERNAL-1",
          includeInternal: false,
        }),
      );
    });

    it("should include internal comments when includeInternal is true", async () => {
      const allComments: Comment[] = [
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

      // Setup mock use case to return all comments
      mockUseCase.execute = mock(() => Promise.resolve(allComments));

      const result = (await handler.handle({
        issueKey: "INTERNAL-2",
        includeInternal: true,
      })) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Public comment");
      expect(result.data).toContain("Internal comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          issueKey: "INTERNAL-2",
          includeInternal: true,
        }),
      );
    });
  });

  describe("parameter validation", () => {
    it("should reject invalid issue key format", async () => {
      // Setup validator to throw error for invalid issue key
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: Issue key must be in the format PROJECT-123", 400,
        );
      });

      const result = await handler.handle({ issueKey: "invalid-key" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain(
        "Issue key must be in the format PROJECT-123",
      );

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should reject maxComments out of range", async () => {
      // Setup validator to throw error for invalid maxComments
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: maxComments must be between 1 and 100", 400,
        );
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        maxComments: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain("maxComments must be between");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should reject maxComments too high", async () => {
      // Setup validator to throw error for maxComments too high
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: maxComments must be between 1 and 100", 400,
        );
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        maxComments: 101,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain("maxComments must be between");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should reject invalid orderBy value", async () => {
      // Setup validator to throw error for invalid orderBy
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: orderBy must be 'created' or 'updated'", 400,
        );
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        orderBy: "invalid" as "created" | "updated",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain("orderBy must be");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should reject empty authorFilter", async () => {
      // Setup validator to throw error for empty authorFilter
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: authorFilter cannot be empty", 400,
        );
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        authorFilter: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain("authorFilter cannot be empty");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should reject invalid date format in dateRange", async () => {
      // Setup validator to throw error for invalid date format
      mockValidator.validateGetCommentsParams = mock(() => {
        throw JiraApiError.withStatusCode("Invalid issue comment parameters: Invalid date format in dateRange", 400,
        );
      });

      const result = await handler.handle({
        issueKey: "TEST-123",
        dateRange: {
          from: "invalid-date",
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue comment parameters");
      expect(result.error).toContain("Invalid date format");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was NOT called
      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle issue not found error", async () => {
      // Setup use case to throw error for non-existent issue
      mockUseCase.execute = mock(() => {
        throw new JiraNotFoundError("Issue", "NONEXIST-1");
      });

      const result = await handler.handle({ issueKey: "NONEXIST-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No Comments Found");
      expect(result.error).toContain("No comments found for issue NONEXIST-1");

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was called
      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    it("should handle permission error", async () => {
      // Setup use case to throw permission error
      mockUseCase.execute = mock(() => {
        throw new JiraPermissionError("Forbidden");
      });

      const result = await handler.handle({ issueKey: "RESTRICT-1" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
      expect(result.error).toContain(
        "You don't have permission to view comments",
      );

      // Verify validator was called
      expect(mockValidator.validateGetCommentsParams).toHaveBeenCalled();
      // Verify use case was called
      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    it("should handle missing repository error", async () => {
      // Create handler without use case and validator
      const handlerWithoutDependencies = new GetIssueCommentsHandler(
        undefined as unknown as GetIssueCommentsUseCase,
        undefined as unknown as IssueCommentValidator,
      );

      const result = await handlerWithoutDependencies.handle({
        issueKey: "TEST-123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Comments Retrieval Failed");
      expect(result.error).toContain("undefined is not an object");
    });
  });

  describe("advanced filtering edge cases", () => {
    it("should handle combined filters correctly", async () => {
      const filteredComments: Comment[] = [
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
      ];

      // Setup mock use case to return filtered comments
      mockUseCase.execute = mock(() => Promise.resolve(filteredComments));

      const params = {
        issueKey: "COMBINED-1",
        authorFilter: "john",
        dateRange: {
          from: "2024-01-15T00:00:00.000Z",
        },
        maxComments: 1,
      };

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("John's recent comment");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining(params),
      );
    });

    it("should handle email-based author filtering", async () => {
      const filteredComments: Comment[] = [
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
      ];

      // Setup mock use case to return filtered comments
      mockUseCase.execute = mock(() => Promise.resolve(filteredComments));

      const params = {
        issueKey: "EMAIL-1",
        authorFilter: "john.doe@company",
      };

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Comment by john.doe");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining(params),
      );
    });
  });
});
