/**
 * JIRA API Domain Models
 *
 * Contains core data structures representing JIRA domain objects
 */

import type { ADFNode } from "../utils/adf-parser";

/**
 * Basic JIRA issue representation
 */
export interface Issue {
  id: string;
  key: string;
  self: string;
  fields?: IssueFields;
}

/**
 * Issue fields structure
 */
export interface IssueFields {
  summary?: string;
  description?: ADFNode | string;
  status?: {
    name: string;
    statusCategory?: {
      name: string;
      colorName: string;
    };
  };
  priority?: {
    name: string;
    iconUrl?: string;
  };
  assignee?: User;
  reporter?: User;
  created?: string;
  updated?: string;
  labels?: string[];
  [key: string]: unknown;
}

/**
 * JIRA user representation
 */
export interface User {
  displayName: string;
  emailAddress?: string;
  accountId: string;
  avatarUrls?: {
    [key: string]: string;
  };
}

/**
 * Search result structure returned by JIRA search endpoint
 */
export interface SearchResult {
  expand?: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: Issue[];
}
