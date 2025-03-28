/**
 * JIRA Error Utilities
 *
 * Custom error classes and error handling utilities for JIRA operations
 */

/**
 * Base error class for all JIRA-related errors
 */
export class JiraError extends Error {
  /**
   * Create a new JiraError
   *
   * @param message - Error message
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "JiraError";
  }
}

/**
 * Error thrown when JIRA configuration is invalid
 */
export class JiraConfigError extends JiraError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "JiraConfigError";
  }
}

/**
 * Error thrown when JIRA authentication fails
 */
export class JiraAuthError extends JiraError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = "JiraAuthError";
  }
}

/**
 * Error thrown when a JIRA API request fails
 */
export class JiraApiError extends JiraError {
  /**
   * Create a new JiraApiError
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string,
    public readonly statusCode?: number,
    cause?: unknown,
  ) {
    super(message, cause);
    this.name = "JiraApiError";
  }
}

/**
 * Error thrown when a JIRA resource is not found
 */
export class JiraNotFoundError extends JiraApiError {
  constructor(message: string, cause?: unknown) {
    super(message, 404, cause);
    this.name = "JiraNotFoundError";
  }
}

/**
 * Determines if an error is a JIRA error
 *
 * @param error - Error to check
 * @returns True if error is a JIRA error
 */
export function isJiraError(error: unknown): error is JiraError {
  return error instanceof JiraError;
}

/**
 * Formats an error for display
 *
 * @param error - Error to format
 * @returns Formatted error message
 */
export function formatJiraError(error: unknown): string {
  if (error instanceof JiraApiError && error.statusCode) {
    return `JIRA API Error (${error.statusCode}): ${error.message}`;
  }

  if (error instanceof JiraError) {
    return `${error.name}: ${error.message}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
