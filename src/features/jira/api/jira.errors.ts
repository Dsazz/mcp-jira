import { HttpError } from "@core/errors";

/**
 * JIRA API Error Types
 *
 * Defines specialized error types for handling JIRA API errors
 */

/**
 * Error response structure returned by JIRA API
 */
export interface JiraErrorResponse {
  errorMessages: string[];
  errors: Record<string, string>;
  status?: number;
}

/**
 * Base error class for all JIRA API errors
 */
export class JiraApiError extends HttpError {
  public readonly response?: JiraErrorResponse;

  constructor(
    message: string,
    statusCode?: number,
    response?: JiraErrorResponse,
  ) {
    super(message, statusCode || 500, { response });
    this.name = "JiraApiError";
    this.response = response;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      response: this.response,
    };
  }
}

/**
 * Error thrown when authentication fails (invalid credentials, token expired)
 */
export class JiraAuthenticationError extends JiraApiError {
  constructor(
    message: string,
    statusCode?: number,
    response?: JiraErrorResponse,
  ) {
    super(message, statusCode || 401, response);
    this.name = "JiraAuthenticationError";
  }
}

/**
 * Error thrown when JIRA configuration is invalid
 */
export class JiraConfigError extends JiraApiError {
  constructor(message: string, cause?: unknown) {
    super(message, 500);
    this.name = "JiraConfigError";
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Error thrown when network requests fail (connection issues, timeouts)
 */
export class JiraNetworkError extends HttpError {
  constructor(message: string) {
    super(message, 0);
    this.name = "JiraNetworkError";
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class JiraNotFoundError extends JiraApiError {
  public readonly resource: string;
  public readonly resourceId: string;

  constructor(
    resource: string,
    id: string,
    statusCode = 404,
    response?: JiraErrorResponse,
  ) {
    super(`${resource} not found: ${id}`, statusCode, response);
    this.name = "JiraNotFoundError";
    this.resource = resource;
    this.resourceId = id;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      resource: this.resource,
      resourceId: this.resourceId,
    };
  }
}

/**
 * Error thrown when JIRA API rate limits are exceeded
 */
export class JiraRateLimitError extends JiraApiError {
  constructor(message: string, statusCode = 429, response?: JiraErrorResponse) {
    super(message, statusCode, response);
    this.name = "JiraRateLimitError";
  }
}

/**
 * Error thrown when user lacks permissions for the requested operation
 */
export class JiraPermissionError extends JiraApiError {
  constructor(message: string, statusCode = 403, response?: JiraErrorResponse) {
    super(message, statusCode, response);
    this.name = "JiraPermissionError";
  }
}

/**
 * Error thrown when issue creation fails due to validation or field issues
 */
export class IssueCreationError extends JiraApiError {
  public readonly field?: string;

  constructor(
    message: string,
    statusCode = 400,
    response?: JiraErrorResponse,
    field?: string,
  ) {
    super(message, statusCode, response);
    this.name = "IssueCreationError";
    this.field = field;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
    };
  }
}

/**
 * Error thrown when project validation fails
 */
export class ProjectValidationError extends JiraApiError {
  public readonly projectKey: string;

  constructor(
    projectKey: string,
    statusCode = 400,
    response?: JiraErrorResponse,
  ) {
    super(
      `Project '${projectKey}' not found or insufficient permissions to create issues`,
      statusCode,
      response,
    );
    this.name = "ProjectValidationError";
    this.projectKey = projectKey;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      projectKey: this.projectKey,
    };
  }
}

/**
 * Error thrown when issue type validation fails
 */
export class IssueTypeValidationError extends JiraApiError {
  public readonly projectKey: string;
  public readonly issueType: string;

  constructor(
    projectKey: string,
    issueType: string,
    statusCode = 400,
    response?: JiraErrorResponse,
  ) {
    super(
      `Issue type '${issueType}' not available for project '${projectKey}'`,
      statusCode,
      response,
    );
    this.name = "IssueTypeValidationError";
    this.projectKey = projectKey;
    this.issueType = issueType;
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      projectKey: this.projectKey,
      issueType: this.issueType,
    };
  }
}

/**
 * Determines if an error is a JIRA error
 *
 * @param error - Error to check
 * @returns True if error is a JIRA error
 */
export function isJiraError(error: unknown): error is JiraApiError {
  return error instanceof JiraApiError;
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

  if (error instanceof JiraApiError) {
    return `${error.name}: ${error.message}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
