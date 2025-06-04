import { ValidationError } from "@core/errors";

/**
 * Error thrown when sprint parameters validation fails
 */
export class SprintParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "SprintParamsValidationError";
  }
}

/**
 * Error thrown when sprint ID validation fails
 */
export class SprintIdValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "SprintIdValidationError";
  }
}
