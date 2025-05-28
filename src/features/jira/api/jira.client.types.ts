/**
 * JIRA API Client Interface
 *
 * Defines the contract for JIRA clients
 */

import type { Issue, Comment, GetCommentsOptions } from "./jira.models.types";
import type {
  IssueResponse,
  IssuesResponse,
  NewIssueResponse,
} from "./jira.responses.types";

/**
 * High-level interface for interacting with JIRA
 */
export interface JiraApiClient {
  /**
   * Get details of a specific issue
   * @param issueKey - The issue key (e.g., "PROJECT-123")
   * @param fields - Optional fields to retrieve
   * @returns Promise resolving to the issue
   */
  getIssue(issueKey: string, fields?: string[]): Promise<Issue>;

  /**
   * Get comments for a specific issue
   * @param issueKey - The issue key (e.g., "PROJECT-123")
   * @param options - Optional comment retrieval options
   * @returns Promise resolving to the comments array
   */
  getIssueComments(issueKey: string, options?: GetCommentsOptions): Promise<Comment[]>;

  /**
   * Get details of a specific issue with response wrapper
   * @param issueKey - The issue key
   * @returns Promise resolving to the response object
   */
  getIssueWithResponse(issueKey: string): Promise<IssueResponse>;

  /**
   * Search for issues using JQL
   * @param jql - JQL query string
   * @param fields - Optional fields to retrieve
   * @param maxResults - Maximum number of results to return
   * @returns Promise resolving to the issues array
   */
  searchIssues(
    jql: string,
    fields?: string[],
    maxResults?: number,
  ): Promise<Issue[]>;

  /**
   * Get issues assigned to the current user
   * @param fields - Optional fields to retrieve
   * @returns Promise resolving to the issues array
   */
  getAssignedIssues(fields?: string[]): Promise<Issue[]>;

  /**
   * Get assigned issues with response wrapper
   * @returns Promise resolving to the response object
   */
  getAssignedIssuesWithResponse(): Promise<IssuesResponse>;

  /**
   * Create a new issue
   * @param projectKey - Project key
   * @param summary - Issue summary
   * @param issueType - Issue type
   * @param description - Issue description
   * @param additionalFields - Additional fields for the issue
   * @returns Promise resolving to the new issue response
   */
  createIssue(
    projectKey: string,
    summary: string,
    issueType?: string,
    description?: string,
    additionalFields?: Record<string, unknown>,
  ): Promise<NewIssueResponse>;
}
