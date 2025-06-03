import { JiraApiError, JiraErrorCode, type JiraErrorResponse } from "./base.error";

/**
 * Error thrown when network requests fail (connection issues, timeouts)
 */
export class JiraNetworkError extends JiraApiError {
  constructor(
    message: string,
    cause?: unknown,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.NETWORK_ERROR, undefined, undefined, context);
    this.name = "JiraNetworkError";
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Error thrown for HTTP 400 Bad Request responses
 */
export class JiraBadRequestError extends JiraApiError {
  constructor(
    message: string,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.BAD_REQUEST_ERROR, response, 400, context);
    this.name = "JiraBadRequestError";
  }
}

/**
 * Error thrown for HTTP 401 Unauthorized responses
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
 * Error thrown for HTTP 403 Forbidden responses
 */
export class JiraPermissionError extends JiraApiError {
  constructor(
    message: string,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.PERMISSION_ERROR, response, 403, context);
    this.name = "JiraPermissionError";
  }
}

/**
 * Error thrown for HTTP 404 Not Found responses
 */
export class JiraNotFoundError extends JiraApiError {
  constructor(
    entityType: string,
    entityId: string | JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    const isResponse = typeof entityId !== "string";
    const message = isResponse 
      ? `${entityType} not found` 
      : `${entityType} '${entityId}' not found`;
    const response = isResponse ? entityId : undefined;
    
    super(message, JiraErrorCode.NOT_FOUND_ERROR, response, 404, context);
    this.name = "JiraNotFoundError";
  }
}

/**
 * Error thrown for HTTP 429 Rate Limit Exceeded responses
 */
export class JiraRateLimitError extends JiraApiError {
  constructor(
    message: string,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.RATE_LIMIT_ERROR, response, 429, context);
    this.name = "JiraRateLimitError";
  }
}

/**
 * Error thrown for HTTP 500 Internal Server Error responses
 */
export class JiraServerError extends JiraApiError {
  constructor(
    message: string,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.SERVER_ERROR, response, 500, context);
    this.name = "JiraServerError";
  }
}
