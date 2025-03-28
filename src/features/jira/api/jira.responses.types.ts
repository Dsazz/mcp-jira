/**
 * JIRA API Response Types
 *
 * Contains response wrapper types and structures returned by the JIRA API client
 */

import type { Issue } from "./jira.models.types";

/**
 * Single issue response with success/error handling
 */
export interface IssueResponse {
  success: boolean;
  data?: Issue;
  error?: string;
}

/**
 * Multiple issues response with success/error handling
 */
export interface IssuesResponse {
  success: boolean;
  data?: Issue[];
  error?: string;
}

/**
 * Response structure when creating a new issue
 */
export interface NewIssueResponse {
  id: string;
  key: string;
  self: string;
}

/**
 * Error response structure returned by UI error handlers
 */
export interface ErrorResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
  errorCode: string;
}

/**
 * Raw API response wrapper for generic data
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
