import { ValidationError } from "@core/errors";

/**
 * Error thrown when board parameters validation fails
 */
export class BoardParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "BoardParamsValidationError";
  }
}

/**
 * Error thrown when board ID validation fails
 */
export class BoardIdValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "BoardIdValidationError";
  }
} 