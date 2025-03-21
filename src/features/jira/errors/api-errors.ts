/**
 * JIRA API error classes
 */

// Base API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number, 
    public readonly errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Resource not found error
export class NotFoundError extends ApiError {
  constructor(
    message: string = 'Resource not found', 
    resourceType: string = 'issue'
  ) {
    super(message, 404, `${resourceType.toUpperCase()}_NOT_FOUND`);
    this.name = 'NotFoundError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Authorization error
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Authorization failed') {
    super(message, 401, 'AUTHORIZATION_FAILED');
    this.name = 'AuthorizationError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Rate limit error
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Server error
export class ServerError extends ApiError {
  constructor(message: string = 'Server error') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// Validation error
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation error') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Issue error classes
export class IssueError extends ApiError {
  constructor(
    message: string,
    public readonly issueKey?: string,
    public readonly cause?: unknown
  ) {
    super(message, undefined, 'ISSUE_ERROR');
    this.name = 'IssueError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, IssueError.prototype);
  }
}

// Task error classes
export class TaskError extends ApiError {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message, undefined, 'TASK_ERROR');
    this.name = 'TaskError';
    // Ensure instanceof works correctly in ES5
    Object.setPrototypeOf(this, TaskError.prototype);
  }
} 