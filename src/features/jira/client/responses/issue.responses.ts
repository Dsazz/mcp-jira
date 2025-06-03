/**
 * JIRA Issue Response Types
 *
 * Contains response types related to JIRA issues
 */

import type { Issue } from "../../repositories/issue.models";

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