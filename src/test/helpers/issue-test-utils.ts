/**
 * Issue test utilities
 */
import type { McpResponse } from "@core/responses";
import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Issue } from "@features/jira/issues/models/issue.models";

/**
 * Creates a standard issue test response
 */
export function createIssueResponse(issue: Issue): McpResponse<Issue> {
  return {
    success: true,
    data: issue,
  };
}

/**
 * Creates a standard comments test response
 */
export function createCommentsResponse(
  comments: Comment[],
): McpResponse<Comment[]> {
  return {
    success: true,
    data: comments,
  };
}

/**
 * Creates a standard error response
 */
export function createErrorResponse(message: string): McpResponse<unknown> {
  return {
    success: false,
    error: message,
  };
}
