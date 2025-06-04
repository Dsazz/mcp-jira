import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { IssueResponse } from "@features/jira/client/responses/issue.responses";
import type { CreateIssueRequest } from "@features/jira/issues/use-cases";
import type { Issue, IssueUpdateRequest } from "../models";

/**
 * Repository interface for core issue CRUD operations
 * Following the cohesive repository pattern from creative design
 */
export interface IssueRepository {
  getIssue(issueKey: string, fields?: string[]): Promise<Issue>;
  createIssue(request: CreateIssueRequest): Promise<Issue>;
  updateIssue(issueKey: string, updates: IssueUpdateRequest): Promise<Issue>;
  getIssueWithResponse(issueKey: string): Promise<IssueResponse>;
}

/**
 * Implementation of IssueRepository
 * Extracted from JiraClient god object - core issue operations only
 */
export class IssueRepositoryImpl implements IssueRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get details of a specific issue
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<Issue> {
    this.logger.debug(`Getting issue: ${issueKey}`, {
      prefix: "JIRA:IssueRepository",
    });

    const queryParams: Record<string, string | undefined> = {};
    if (fields && fields.length > 0) {
      queryParams.fields = fields.join(",");
    }

    return this.httpClient.sendRequest<Issue>({
      endpoint: `issue/${issueKey}`,
      method: "GET",
      queryParams,
    });
  }

  /**
   * Create a new issue with the provided request data
   */
  async createIssue(request: CreateIssueRequest): Promise<Issue> {
    this.logger.debug(
      `Creating issue in project: ${request.fields.project.key}`,
      {
        prefix: "JIRA:IssueRepository",
      },
    );

    const response = await this.httpClient.sendRequest<{
      key: string;
      id: string;
    }>({
      endpoint: "issue",
      method: "POST",
      body: request,
    });

    // Return the created issue by fetching it
    return this.getIssue(response.key);
  }

  /**
   * Update an existing issue
   */
  async updateIssue(
    issueKey: string,
    updates: IssueUpdateRequest,
  ): Promise<Issue> {
    this.logger.debug(`Updating issue: ${issueKey}`, {
      prefix: "JIRA:IssueRepository",
    });

    await this.httpClient.sendRequest<void>({
      endpoint: `issue/${issueKey}`,
      method: "PUT",
      body: updates,
    });

    // Return the updated issue by fetching it
    return this.getIssue(issueKey);
  }

  /**
   * Get details for a specific issue with response wrapper
   */
  async getIssueWithResponse(issueKey: string): Promise<IssueResponse> {
    try {
      const issue = await this.getIssue(issueKey);
      return {
        success: true,
        data: issue,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
