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
