/**
 * Issue create formatter
 */
import type { CreateIssueRequest } from "@features/jira/issues/use-cases/create-issue.use-case";
import type { Formatter } from "@features/jira/shared";

/**
 * Formatter class for issue creation requests
 */
export class IssueCreateFormatter implements Formatter<CreateIssueRequest, string> {
  /**
   * Format an issue creation request for the API
   */
  format(request: CreateIssueRequest) {
    return {
      fields: {
        project: {
          key: request.projectKey,
        },
        summary: request.summary,
        description: request.description,
        issuetype: {
          name: request.issueType,
        },
        ...(request.customFields || {}),
      },
    };
  }
}
