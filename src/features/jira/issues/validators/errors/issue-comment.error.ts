import { ValidationError } from "@core/errors";

/**
 * Error thrown when issue comment parameters validation fails
 */
export class CommentParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "CommentParamsValidationError";
  }
}

/**
 * Error thrown when comment ID validation fails
 */
export class CommentIdValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "CommentIdValidationError";
  }
}
