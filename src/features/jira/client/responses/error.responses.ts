/**
 * JIRA Error Response Types
 *
 * Contains response types related to errors returned by the JIRA API
 */

/**
 * Error response structure returned by UI error handlers
 */
export interface ErrorResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
  errorCode: string;
}
