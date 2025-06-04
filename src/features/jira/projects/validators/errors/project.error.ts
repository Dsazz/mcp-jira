import {
  JiraApiError,
  JiraErrorCode,
  type JiraErrorResponse,
} from "@features/jira/client/errors/base.error";

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
