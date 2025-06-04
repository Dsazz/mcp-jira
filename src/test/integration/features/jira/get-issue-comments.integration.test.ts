/**
 * Get Issue Comments Integration Tests
 */
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import { JiraNotFoundError } from "@features/jira/client/errors";
import type { IssueCommentRepository } from "@features/jira/issues/repositories";
import type {
  Comment,
  GetCommentsOptions,
} from "@features/jira/issues/models/comment.models";
import { GetIssueCommentsHandler } from "@features/jira/issues/tools/handlers/get-issue-comments.handler";
import { GetIssueCommentsUseCaseImpl } from "@features/jira/issues/use-cases/get-issue-comments.use-case";
import { IssueCommentValidatorImpl } from "@features/jira/issues/validators";

describe("Get Issue Comments Integration Tests", () => {
  const mockIssueCommentRepository = mock<IssueCommentRepository>();
  const issueCommentValidator = new IssueCommentValidatorImpl();
  const getIssueCommentsUseCase = new GetIssueCommentsUseCaseImpl(
    mockIssueCommentRepository,
    issueCommentValidator
  );
  const getIssueCommentsHandler = new GetIssueCommentsHandler(
    getIssueCommentsUseCase
  );

  beforeEach(() => {
    mockIssueCommentRepository.mockClear();
  });

  it("returns a list of comments", async () => {
    // Arrange
    const mockComments: Comment[] = [
      {
        id: "1",
        body: "Test comment 1",
        author: { displayName: "Test User 1", accountId: "user1" },
        created: "2023-05-15T10:00:00.000Z",
        updated: "2023-05-15T10:00:00.000Z",
      },
      {
        id: "2",
        body: "Test comment 2",
        author: { displayName: "Test User 2", accountId: "user2" },
        created: "2023-05-16T10:00:00.000Z",
        updated: "2023-05-16T10:00:00.000Z",
      },
    ];

    mockIssueCommentRepository.getComments.mockResolvedValue(mockComments);

    // Act
    const result = await getIssueCommentsHandler.execute({
      issueKey: "TEST-1",
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
    expect(result.data).toEqual(mockComments);
    expect(mockIssueCommentRepository.getComments).toHaveBeenCalledWith({
      issueKey: "TEST-1",
    });
  });

  it("passes options to repository", async () => {
    // Arrange
    const mockComments: Comment[] = [
      {
        id: "1",
        body: "Test comment 1",
        author: { displayName: "Test User 1", accountId: "user1" },
        created: "2023-05-15T10:00:00.000Z",
        updated: "2023-05-15T10:00:00.000Z",
      },
    ];

    const options: GetCommentsOptions = {
      issueKey: "TEST-1",
      maxResults: 10,
      orderBy: "created",
      expand: ["renderedBody"],
    };

    mockIssueCommentRepository.getComments.mockResolvedValue(mockComments);

    // Act
    const result = await getIssueCommentsHandler.execute(options);

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
    expect(mockIssueCommentRepository.getComments).toHaveBeenCalledWith(options);
  });

  it("returns error when issue does not exist", async () => {
    // Arrange
    mockIssueCommentRepository.getComments.mockRejectedValue(
      new JiraNotFoundError("Issue not found")
    );

    // Act
    const result = (await getIssueCommentsHandler.execute({
      issueKey: "INVALID-1",
    })) as McpResponse<Comment[], string>;

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe("error");
    expect(result.error).toBe("Issue not found");
  });

  it("validates issueKey", async () => {
    // Act
    const result = (await getIssueCommentsHandler.execute({
      issueKey: "",
    })) as McpResponse<Comment[], string>;

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe("error");
    expect(result.error).toBe("Invalid issue key");
    expect(mockIssueCommentRepository.getComments).not.toHaveBeenCalled();
  });
});
