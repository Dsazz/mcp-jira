/**
 * Get Issue Comments Integration Tests
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import { JiraNotFoundError } from "@features/jira/client/errors";
import type { IssueCommentRepository } from "@features/jira/repositories";
import type {
  Comment,
  GetCommentsOptions,
} from "@features/jira/repositories/comment.models";
import { GetIssueCommentsHandler } from "@features/jira/tools/handlers/get-issue-comments.handler";
import { GetIssueCommentsUseCaseImpl } from "@features/jira/use-cases";
import { IssueCommentValidatorImpl } from "@features/jira/validators";

describe("GetIssueComments Integration", () => {
  let handler: GetIssueCommentsHandler;
  let mockRepository: IssueCommentRepository;

  // Mock comments for testing
  const mockComments: Comment[] = [
    {
      id: "1",
      self: "https://jira.example.com/rest/api/2/comment/1",
      author: {
        accountId: "user1",
        displayName: "John Doe",
        emailAddress: "john@example.com",
      },
      body: "Sample comment 1",
      created: "2023-01-01T10:00:00.000Z",
      updated: "2023-01-01T10:00:00.000Z",
    },
    {
      id: "2",
      self: "https://jira.example.com/rest/api/2/comment/2",
      author: {
        accountId: "user2",
        displayName: "Jane Smith",
        emailAddress: "jane@example.com",
      },
      body: "Sample comment 2",
      created: "2023-01-02T10:00:00.000Z",
      updated: "2023-01-02T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      getIssueComments: mock(
        (issueKey: string, _options?: GetCommentsOptions) => {
          if (issueKey === "TEST-123") {
            return Promise.resolve(mockComments);
          }
          throw new JiraNotFoundError("Issue", issueKey);
        },
      ),
    };

    // Create use case and validator with mock repository
    const useCase = new GetIssueCommentsUseCaseImpl(mockRepository);
    const validator = new IssueCommentValidatorImpl();

    // Create handler with use case and validator
    handler = new GetIssueCommentsHandler(useCase, validator);
  });

  it("should retrieve comments for a valid issue", async () => {
    // Mock ID and key from JIRA API test fixtures
    const issueKey = "TEST-123";

    // Call handler
    const result = (await handler.handle({
      issueKey,
      maxComments: 10,
      includeInternal: false,
      orderBy: "created",
    })) as McpResponse<string>;

    // Verify result includes expected content
    expect(result.success).toBe(true);
    expect(result.data).toContain(issueKey);
    expect(result.data).toContain("Comments");
    expect(result.data).toContain("John Doe");
    expect(result.data).toContain("Jane Smith");
    expect(result.data).toContain("Sample comment 1");
    expect(result.data).toContain("Sample comment 2");

    // Verify repository was called
    expect(mockRepository.getIssueComments).toHaveBeenCalled();
  });

  it("should handle non-existent issue", async () => {
    const nonExistingIssueKey = "NONEXIST-1";

    // Call handler with non-existent issue key
    const result = (await handler.handle({
      issueKey: nonExistingIssueKey,
      maxComments: 10,
      includeInternal: false,
      orderBy: "created",
    })) as McpResponse<string>;

    // Verify it returns an error response
    expect(result.success).toBe(false);
    expect(result.error).toContain("API Error");

    // Verify repository was called
    expect(mockRepository.getIssueComments).toHaveBeenCalled();
  });
});
