/**
 * Type definitions for JIRA API entities
 */

export interface IssuePriority {
  name: string;
  id?: string;
  iconUrl?: string;
}

export interface IssueStatus {
  name: string;
  id?: string;
  statusCategory?: {
    key: string;
    name: string;
  };
}

export interface IssueAssignee {
  displayName: string;
  emailAddress?: string;
  accountId?: string;
  active?: boolean;
}

export interface IssueFields {
  summary: string;
  description?: string;
  status: IssueStatus;
  priority?: IssuePriority;
  assignee?: IssueAssignee;
  created?: string;
  updated?: string;
  labels?: string[];
  project?: {
    key: string;
    name?: string;
  };
}

export interface Issue {
  key: string;
  id: string;
  fields: IssueFields;
  self?: string;
}

export interface SearchResponse {
  issues: Issue[];
  total: number;
  maxResults: number;
  startAt: number;
}

export interface CreateIssueResponse {
  id: string;
  key: string;
  self?: string;
}

export interface ApiError {
  errorMessages?: string[];
  errors?: Record<string, string>;
  status?: number;
  statusText?: string;
}

// MCP Tool Response
export interface McpResponse {
  content: Array<{
    type: 'text';
    text: string;
    [key: string]: unknown;
  }>;
  isError?: boolean;
  errorCode?: string;
  errorDetails?: string;
  [key: string]: unknown;
} 