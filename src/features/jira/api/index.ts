/**
 * JIRA API Module
 *
 * This module provides a client for interacting with the JIRA API.
 * It includes domain models, client interfaces, and error types
 * organized in a clear, maintainable structure.
 */

// Main client and factory
export { JiraClient, createJiraClient } from "./jira.client.impl";

// Client interface
export type { JiraApiClient } from "./jira.client.types";

// Configuration
export type { JiraClientConfig } from "./jira.config.types";
export {
  JiraConfig,
  validateJiraConfig,
  defaultJiraConfig,
} from "./jira.config.types";

// Schemas and validation
export {
  issueKeySchema,
  getIssueCommentsSchema,
  searchJiraIssuesBaseSchema,
  searchJiraIssuesSchema,
  issueFieldsSchema,
  buildJQLFromHelpers,
  type GetIssueCommentsParams,
  type SearchJiraIssuesParams,
  type JiraIssue,
  type JiraIssueList,
} from "./jira.schemas";

// HTTP interfaces
export type { HttpClient, HttpRequestOptions } from "./jira.http.types";

// Domain models
export type {
  Issue,
  IssueFields,
  User,
  SearchResult,
} from "./jira.models.types";

// Response types
export type {
  IssueResponse,
  IssuesResponse,
  NewIssueResponse,
  ErrorResponse,
  ApiResponse,
} from "./jira.responses.types";

// Error types
export {
  JiraApiError,
  JiraAuthenticationError,
  JiraConfigError,
  JiraNetworkError,
  JiraNotFoundError,
  JiraRateLimitError,
  JiraPermissionError,
  isJiraError,
  formatJiraError,
  type JiraErrorResponse,
} from "./jira.errors";

// Internal implementation - not recommended for direct use
export { JiraHttpClient } from "./jira.http-client.impl";
