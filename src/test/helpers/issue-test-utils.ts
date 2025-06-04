/**
 * Issue test utilities
 */
import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { McpResponse } from "@core/responses/mcp-response";

/**
 * Creates a standard issue test response
 */
export function createIssueResponse(issue: Issue): McpResponse<Issue> {
  return {
    success: true,
    data: issue,
    error: null
  };
}

/**
 * Creates a standard comments test response
 */
export function createCommentsResponse(comments: Comment[]): McpResponse<Comment[]> {
  return {
    success: true,
    data: comments,
    error: null
  };
}

/**
 * Creates a standard error response
 */
export function createErrorResponse(message: string): McpResponse<unknown> {
  return {
    success: false,
    data: null,
    error: message
  };
}
