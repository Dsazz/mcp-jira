/**
 * Shared Type Guards for Tests
 *
 * Contains type guards that can be reused across integration tests
 * to check response types and data structures safely.
 */

import type { McpResponse } from "@core/responses";
import type { IssueSearchResult } from "@features/jira/issues/models/issue-search.models";

/**
 * Type guard to check if unknown data contains valid issues array
 */
function hasValidIssues(data: unknown): data is IssueSearchResult {
  return (
    typeof data === "object" &&
    data !== null &&
    "issues" in data &&
    Array.isArray((data as IssueSearchResult).issues)
  );
}

/**
 * Type guard to check if unknown data contains valid issues array with items
 */
function hasValidIssuesWithItems(data: unknown): data is IssueSearchResult {
  return hasValidIssues(data) && (data as IssueSearchResult).issues.length > 0;
}

/**
 * Type guard to check if McpResponse is successful and contains SearchResult data
 */
export function isSuccessfulSearchResult(
  result: McpResponse<unknown>,
): result is McpResponse<IssueSearchResult> & { success: true; data: IssueSearchResult } {
  return (
    result.success && result.data !== undefined && hasValidIssues(result.data)
  );
}

/**
 * Type guard to check if McpResponse is successful and contains SearchResult with issues
 */
export function isSuccessfulSearchResultWithIssues(
  result: McpResponse<unknown>,
): result is McpResponse<IssueSearchResult> & { success: true; data: IssueSearchResult } {
  return (
    result.success &&
    result.data !== undefined &&
    hasValidIssuesWithItems(result.data)
  );
}

/**
 * Type guard to check if McpResponse is successful (regardless of data type)
 */
export function isSuccessfulResponse<T>(
  result: McpResponse<T>,
): result is McpResponse<T> & { success: true; data: T } {
  return result.success && result.data !== undefined;
}
