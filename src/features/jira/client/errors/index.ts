/**
 * JIRA Client Error Exports
 *
 * Provides all error types for the JIRA client
 */

// Base error types
import {
  JiraApiError,
  JiraConfigError,
  JiraErrorCode,
  type JiraErrorResponse,
} from "./base.error";
export { JiraApiError, JiraConfigError, JiraErrorCode, type JiraErrorResponse };

// HTTP errors
import {
  JiraBadRequestError,
  JiraNetworkError,
  JiraNotFoundError,
  JiraPermissionError,
  JiraRateLimitError,
  JiraServerError,
} from "./http.error";
export {
  JiraBadRequestError,
  JiraNetworkError,
  JiraNotFoundError,
  JiraPermissionError,
  JiraRateLimitError,
  JiraServerError,
};

// Authentication errors
import { JiraAuthenticationError } from "./auth.error";
export { JiraAuthenticationError };

// Import domain-specific validation errors
import {
  CommentIdValidationError,
  CommentParamsValidationError,
  IssueCreateParamsValidationError,
  IssueCreationError,
  IssueTransitionValidationError,
  IssueTypeValidationError,
  IssueUpdateParamsValidationError,
  WorklogIdValidationError,
  WorklogParamsValidationError,
  WorklogTimeFormatValidationError,
} from "@features/jira/issues/validators/errors";

import {
  BoardIdValidationError,
  BoardParamsValidationError,
} from "@features/jira/boards/validators/errors";

import { ProjectValidationError } from "@features/jira/projects/validators/errors";

import {
  SprintIdValidationError,
  SprintParamsValidationError,
} from "@features/jira/sprints/validators/errors";

export {
  // For backward compatibility, we re-export all validator errors
  BoardIdValidationError,
  BoardParamsValidationError,
  CommentIdValidationError,
  CommentParamsValidationError,
  IssueCreateParamsValidationError,
  IssueCreationError,
  IssueTransitionValidationError,
  IssueTypeValidationError,
  IssueUpdateParamsValidationError,
  ProjectValidationError,
  SprintIdValidationError,
  SprintParamsValidationError,
  WorklogIdValidationError,
  WorklogParamsValidationError,
  WorklogTimeFormatValidationError,
};

/**
 * Determines if an error is a JIRA error
 *
 * @param error - Error to check
 * @returns True if error is a JIRA error
 */
export function isJiraError(error: unknown): boolean {
  return error instanceof JiraApiError;
}

/**
 * Formats an error for display
 *
 * @param error - Error to format
 * @returns Formatted error message
 */
export function formatJiraError(error: unknown): string {
  // Handle HttpError-derived classes with statusCode
  if (
    error instanceof JiraApiError &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return `JIRA API Error (${error.statusCode}): ${error.message}`;
  }

  // Handle base JiraApiError
  if (error instanceof JiraApiError) {
    return `${error.name}: ${error.message}`;
  }

  // Handle generic errors
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  // Handle unknown values
  return `Unknown error: ${String(error)}`;
}
