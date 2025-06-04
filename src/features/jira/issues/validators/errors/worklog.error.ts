import { ValidationError } from "@core/errors";

/**
 * Error thrown when worklog parameters validation fails
 */
export class WorklogParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "WorklogParamsValidationError";
  }
}

/**
 * Error thrown when worklog time format validation fails
 */
export class WorklogTimeFormatValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "WorklogTimeFormatValidationError";
  }
}

/**
 * Error thrown when worklog ID validation fails
 */
export class WorklogIdValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "WorklogIdValidationError";
  }
}
