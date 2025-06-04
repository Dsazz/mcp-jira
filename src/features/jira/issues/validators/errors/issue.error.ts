import {
  JiraApiError,
  JiraErrorCode,
  type JiraErrorResponse,
} from "@features/jira/client";

/**
 * Error thrown when issue creation fails due to validation or field issues
 */
export class IssueCreationError extends JiraApiError {
  public readonly field?: string;

  constructor(
    message: string,
    statusCode = 400,
    response?: JiraErrorResponse,
    field?: string,
    context?: Record<string, unknown>,
  ) {
    super(
      message,
      JiraErrorCode.VALIDATION_ERROR,
      response,
      statusCode,
      field ? { ...context, field } : context,
    );
    this.name = "IssueCreationError";
    this.field = field;
  }
}

/**
 * Error thrown when issue type validation fails
 */
export class IssueTypeValidationError extends JiraApiError {
  public readonly projectKey: string;
  public readonly issueType: string;

  constructor(
    projectKey: string,
    issueType: string,
    statusCode = 400,
    response?: JiraErrorResponse,
    context?: Record<string, unknown>,
  ) {
    super(
      `Issue type '${issueType}' not available for project '${projectKey}'`,
      JiraErrorCode.VALIDATION_ERROR,
      response,
      statusCode,
      { ...context, projectKey, issueType },
    );
    this.name = "IssueTypeValidationError";
    this.projectKey = projectKey;
    this.issueType = issueType;
  }
}
