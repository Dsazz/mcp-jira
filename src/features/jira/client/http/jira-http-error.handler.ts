/**
 * JIRA-Specific HTTP Error Handler
 *
 * Extends the base HTTP error handler to handle JIRA-specific error responses
 */
import { BaseHttpErrorHandler, type ErrorResponse } from "@core/errors";
import {
  JiraApiError,
  JiraAuthenticationError,
  JiraErrorCode,
  type JiraErrorResponse,
} from "../errors";

/**
 * JIRA-specific HTTP error handler that converts responses to JIRA error types
 */
export class JiraHttpErrorHandler extends BaseHttpErrorHandler {
  /**
   * Override to handle JIRA-specific error response format
   */
  protected async parseErrorData(
    response: Response,
  ): Promise<JiraErrorResponse> {
    try {
      return (await response.json()) as JiraErrorResponse;
    } catch (_e) {
      // Provide fallback error data when JSON parsing fails
      const statusText = response.statusText || `HTTP ${response.status}`;
      return {
        errorMessages: [statusText],
        errors: {},
      };
    }
  }

  /**
   * Override to throw JIRA-specific error types based on HTTP status code
   */
  protected throwAppropriateError(
    status: number,
    errorMessage: string,
    errorData: ErrorResponse,
  ): never {
    const jiraErrorData = errorData as JiraErrorResponse;

    switch (status) {
      case 401:
        throw new JiraAuthenticationError(
          errorMessage || `Authentication failed: HTTP ${status}`,
          status,
          jiraErrorData,
        );
      case 404:
        throw new JiraApiError(
          errorMessage,
          JiraErrorCode.NOT_FOUND_ERROR,
          jiraErrorData,
          status,
        );
      case 403:
        throw new JiraApiError(
          `Access forbidden: ${errorMessage}`,
          JiraErrorCode.PERMISSION_ERROR,
          jiraErrorData,
          status,
        );
      case 429:
        throw new JiraApiError(
          `Rate limit exceeded: ${errorMessage}`,
          JiraErrorCode.RATE_LIMIT_ERROR,
          jiraErrorData,
          status,
        );
      default:
        throw new JiraApiError(
          errorMessage,
          JiraErrorCode.API_ERROR,
          jiraErrorData,
          status,
        );
    }
  }
}
