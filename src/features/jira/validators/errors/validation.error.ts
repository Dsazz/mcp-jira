import { ValidationError } from "@core/errors";

/**
 * Error specific to JIRA issue validation failures
 * Used when validating issue creation or update parameters
 */
export class JiraIssueValidationError extends ValidationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = "JiraIssueValidationError";
  }
}
