/**
 * JIRA API Client Implementation
 *
 * High-level client for interacting with JIRA API
 */
import { logger } from "@core/logging";
import type { JiraApiClient } from "./jira.client.types";
import type { JiraConfig } from "./jira.config.types";
import { JiraApiError } from "./jira.errors";
import { JiraHttpClient } from "./jira.http-client.impl";
import type { HttpClient } from "./jira.http.types";
import type { Issue, SearchResult } from "./jira.models.types";
import type {
  IssueResponse,
  IssuesResponse,
  NewIssueResponse,
} from "./jira.responses.types";

/**
 * JIRA client for interacting with JIRA API
 */
export class JiraClient implements JiraApiClient {
  protected readonly httpClient: HttpClient;

  /**
   * Create a new JIRA client
   *
   * @param jiraConfig - JIRA configuration object
   * @throws JiraApiError if validation fails
   */
  constructor(jiraConfig: JiraConfig) {
    // Validate configuration
    const validation = jiraConfig.validate();

    if (!validation.valid) {
      // Log validation failure at client level
      logger.error("JIRA client configuration is invalid", {
        prefix: "JIRA:Client",
      });

      // Throw error with validation details
      throw new JiraApiError(
        `JIRA configuration is invalid:\n${validation.errors.map((err) => `- ${err}`).join("\n")}`,
      );
    }

    logger.info(
      `JIRA client configured successfully for ${jiraConfig.get().hostUrl}`,
      { prefix: "JIRA:Client" },
    );
    this.httpClient = new JiraHttpClient(jiraConfig);
  }

  /**
   * Get details of a specific issue
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<Issue> {
    logger.debug(`Getting issue: ${issueKey}`, { prefix: "JIRA:Client" });

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

  /**
   * Search for issues using JQL
   */
  async searchIssues(
    jql: string,
    fields?: string[],
    maxResults = 50,
  ): Promise<Issue[]> {
    logger.debug(`Searching issues with JQL: ${jql}`, {
      prefix: "JIRA:Client",
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
    logger.debug("Getting issues assigned to current user", {
      prefix: "JIRA:Client",
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

  /**
   * Create a new issue
   */
  async createIssue(
    projectKey: string,
    summary: string,
    issueType = "Task",
    description = "",
    additionalFields: Record<string, unknown> = {},
  ): Promise<NewIssueResponse> {
    logger.debug(`Creating issue in project: ${projectKey}`, {
      prefix: "JIRA:Client",
    });

    const body = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
        ...additionalFields,
      },
    };

    return this.httpClient.sendRequest({
      endpoint: "issue",
      method: "POST",
      body,
    });
  }

  /**
   * Get user information for current JIRA user
   */
  async getCurrentUser(): Promise<unknown> {
    logger.debug("Getting current user", { prefix: "JIRA:Client" });

    return this.httpClient.sendRequest({
      endpoint: "myself",
      method: "GET",
    });
  }
}

/**
 * Create a new JIRA client
 *
 * @param jiraConfig - Validated JIRA configuration object
 */
export function createJiraClient(jiraConfig: JiraConfig): JiraClient {
  return new JiraClient(jiraConfig);
}
