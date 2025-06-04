import { ValidationError } from "@core/errors";
import {
  JiraApiError,
  JiraErrorCode,
  type JiraErrorResponse,
} from "@features/jira/client/errors/base.error";

/**
 * Error thrown when project parameters validation fails
 */
export class ProjectParamsValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "ProjectParamsValidationError";
  }
}

/**
 * Error thrown when project use case operations fail
 */
export class ProjectUseCaseError extends JiraApiError {
  constructor(
    message: string,
    statusCode = 500,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(message, JiraErrorCode.SERVER_ERROR, response, statusCode, context);
    this.name = "ProjectUseCaseError";
  }
}

/**
 * Error thrown when project validation fails
 */
export class ProjectValidationError extends JiraApiError {
  public readonly projectKey: string;

  constructor(
    projectKey: string,
    statusCode = 400,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(
      `Project '${projectKey}' not found or insufficient permissions to create issues`,
      JiraErrorCode.VALIDATION_ERROR,
      response,
      statusCode,
      { ...context, projectKey },
    );
    this.name = "ProjectValidationError";
    this.projectKey = projectKey;
  }
}
