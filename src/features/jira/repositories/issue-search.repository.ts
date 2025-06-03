import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { IssuesResponse } from "@features/jira/client/responses/issue.responses";
import type { Issue } from "./issue.models";
import type { SearchResult } from "./search.models";

/**
 * Repository interface for issue search and JQL querying
 * Clear responsibility: managing issue search operations and queries
 */
export interface IssueSearchRepository {
  searchIssues(
    jql: string,
    fields?: string[],
    maxResults?: number,
  ): Promise<Issue[]>;
  getAssignedIssues(fields?: string[]): Promise<Issue[]>;
  getAssignedIssuesWithResponse(): Promise<IssuesResponse>;
}

/**
 * Implementation of IssueSearchRepository
 * Extracted from JiraClient god object - specialized for search operations
 */
export class IssueSearchRepositoryImpl implements IssueSearchRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Search for issues using JQL
   */
  async searchIssues(
    jql: string,
    fields?: string[],
    maxResults = 50,
  ): Promise<Issue[]> {
    this.logger.debug(`Searching issues with JQL: ${jql}`, {
      prefix: "JIRA:IssueSearchRepository",
    });

    const queryParams: Record<string, string | number | undefined> = {
      jql,
      maxResults,
    };

    if (fields && fields.length > 0) {
      queryParams.fields = fields.join(",");
    }

    const response = await this.httpClient.sendRequest<SearchResult>({
      endpoint: "search",
      method: "GET",
      queryParams,
    });

    return response.issues;
  }

  /**
   * Get issues assigned to the current user
   */
  async getAssignedIssues(fields?: string[]): Promise<Issue[]> {
    this.logger.debug("Getting issues assigned to current user", {
      prefix: "JIRA:IssueSearchRepository",
    });

    const jql = "assignee = currentUser() ORDER BY updated DESC";
    return this.searchIssues(jql, fields);
  }

  /**
   * Get assigned issues with response wrapper
   */
  async getAssignedIssuesWithResponse(): Promise<IssuesResponse> {
    try {
      const issues = await this.getAssignedIssues();
      return {
        success: true,
        data: issues,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
