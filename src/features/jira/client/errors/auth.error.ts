import { JiraApiError, JiraErrorCode, type JiraErrorResponse } from "./base.error";

/**
 * Error thrown when authentication fails (invalid credentials, token expired)
 */
export class JiraAuthenticationError extends JiraApiError {
  constructor(
    message: string,
    statusCode = 401,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.AUTHENTICATION_ERROR, response, statusCode, context);
    this.name = "JiraAuthenticationError";
  }
}

/**
 * Error thrown when user lacks permissions for the requested operation
 */
export class JiraPermissionError extends JiraApiError {
  constructor(
    message: string,
    statusCode = 403,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.PERMISSION_ERROR, response, statusCode, context);
    this.name = "JiraPermissionError";
  }
}
