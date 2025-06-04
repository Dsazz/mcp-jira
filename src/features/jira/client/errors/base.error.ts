import { McpError } from "@core/errors";

/**
 * JIRA API Error Codes
 * Standard error codes used across JIRA API errors
 */
export enum JiraErrorCode {
  API_ERROR = "JIRA_API_ERROR",
  CONFIG_ERROR = "JIRA_CONFIG_ERROR",
  VALIDATION_ERROR = "JIRA_VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "JIRA_AUTHENTICATION_ERROR",
  PERMISSION_ERROR = "JIRA_PERMISSION_ERROR",
  NOT_FOUND_ERROR = "JIRA_NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR = "JIRA_RATE_LIMIT_ERROR",
  SERVER_ERROR = "JIRA_SERVER_ERROR",
  NETWORK_ERROR = "JIRA_NETWORK_ERROR",
  BAD_REQUEST_ERROR = "JIRA_BAD_REQUEST_ERROR",
}

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
export class JiraApiError extends McpError {
  public readonly response?: JiraErrorResponse;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: string | JiraErrorCode = JiraErrorCode.API_ERROR,
    response?: JiraErrorResponse,
    statusCode?: number,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context ? { ...context, response } : { response });
    this.name = "JiraApiError";
    this.response = response;
    this.statusCode = statusCode;
  }

  /**
   * Create API error with status code
   * Factory method for creating errors with status codes
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param context - Additional context information
   * @returns JiraApiError instance
   */
  static withStatusCode(
    message: string,
    statusCode: number,
    context?: Record<string, unknown>,
  ): JiraApiError {
    return new JiraApiError(
      message,
      JiraErrorCode.API_ERROR,
      undefined,
      statusCode,
      context,
    );
  }

  /**
   * Create API error with custom code
   * Factory method for creating errors with custom error codes
   *
   * @param message - Error message
   * @param code - Custom error code
   * @param context - Additional context information
   * @returns JiraApiError instance
   */
  static withCode(
    message: string,
    code: string | JiraErrorCode,
    context?: Record<string, unknown>,
  ): JiraApiError {
    return new JiraApiError(message, code, undefined, undefined, context);
  }

  /**
   * Create API error from API response
   * Factory method for creating errors from API responses
   *
   * @param message - Error message
   * @param response - JIRA API error response
   * @param statusCode - HTTP status code
   * @param context - Additional context information
   * @returns JiraApiError instance
   */
  static fromResponse(
    message: string,
    response: JiraErrorResponse,
    statusCode?: number,
    context?: Record<string, unknown>,
  ): JiraApiError {
    return new JiraApiError(
      message,
      JiraErrorCode.API_ERROR,
      response,
      statusCode,
      context,
    );
  }

  /**
   * Convert error to JSON-serializable object
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      response: this.response,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error thrown when JIRA configuration is invalid
 */
export class JiraConfigError extends JiraApiError {
  constructor(
    message: string,
    cause?: unknown,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.CONFIG_ERROR, undefined, undefined, context);
    this.name = "JiraConfigError";
    if (cause) {
      this.cause = cause;
    }
  }
}
