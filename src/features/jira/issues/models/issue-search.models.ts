/**
 * Issue Search Models
 */

import type { Issue } from "./issue.models";

export interface SearchIssuesOptions {
  jql: string;
  maxResults?: number;
  startAt?: number;
  fields?: string[];
}

export interface SearchIssuesResponse {
  issues: Issue[];
  maxResults: number;
  startAt: number;
  total: number;
}

/**
 * Search result structure returned by JIRA search endpoint
 */
export interface IssueSearchResult {
  expand?: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Issue[];
}
