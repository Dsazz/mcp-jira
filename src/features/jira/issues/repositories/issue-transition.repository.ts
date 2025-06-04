import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { Transition } from "./issue.types";

/**
 * Repository interface for issue transition operations
 * Clear responsibility: managing issue status transitions and workflow
 */
export interface IssueTransitionRepository {
  getIssueTransitions(issueKey: string): Promise<Transition[]>;
  transitionIssue(
    issueKey: string,
    transitionId: string,
    fields?: Record<string, unknown>,
  ): Promise<void>;
}

/**
 * Implementation of IssueTransitionRepository
 * Extracted from JiraClient god object - transition operations only
 */
export class IssueTransitionRepositoryImpl
  implements IssueTransitionRepository
{
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get available transitions for an issue
   */
  async getIssueTransitions(issueKey: string): Promise<Transition[]> {
    this.logger.debug(`Getting transitions for issue: ${issueKey}`, {
      prefix: "JIRA:IssueTransitionRepository",
    });

    const response = await this.httpClient.sendRequest<{
      transitions: Transition[];
    }>({
      endpoint: `issue/${issueKey}/transitions`,
      method: "GET",
    });

    this.logger.debug(
      `Retrieved ${response.transitions.length} transitions for issue: ${issueKey}`,
      {
        prefix: "JIRA:IssueTransitionRepository",
      },
    );

    return response.transitions;
  }

  /**
   * Transition an issue to a new status
   */
  async transitionIssue(
    issueKey: string,
    transitionId: string,
    fields?: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug(
      `Transitioning issue: ${issueKey} with transition: ${transitionId}`,
      {
        prefix: "JIRA:IssueTransitionRepository",
      },
    );

    const body: Record<string, unknown> = {
      transition: {
        id: transitionId,
      },
    };

    if (fields) {
      body.fields = fields;
    }

    await this.httpClient.sendRequest<void>({
      endpoint: `issue/${issueKey}/transitions`,
      method: "POST",
      body,
    });

    this.logger.debug(`Successfully transitioned issue: ${issueKey}`, {
      prefix: "JIRA:IssueTransitionRepository",
    });
  }
}
