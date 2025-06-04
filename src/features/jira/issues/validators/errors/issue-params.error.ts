import { ValidationError } from "@core/errors";

/**
 * Error thrown when issue creation parameters validation fails
 */
export class IssueCreateParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "IssueCreateParamsValidationError";
  }
}

/**
 * Error thrown when issue update parameters validation fails
 */
export class IssueUpdateParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "IssueUpdateParamsValidationError";
  }
}

/**
 * Error thrown when issue transition parameters validation fails
 */
export class IssueTransitionValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "IssueTransitionValidationError";
  }
}
