/**
 * JIRA API Domain Models
 *
 * Contains core data structures representing JIRA domain objects
 */

import type { ADFNode, ADFDocument } from "../utils/adf-parser";

/**
 * Basic JIRA issue representation
 */
export interface Issue {
  id: string;
  key: string;
  self: string | null;
  fields?: IssueFields | null;
}

/**
 * Issue fields structure
 */
export interface IssueFields {
  summary?: string | null;
  description?: ADFDocument | ADFNode | string | null;
  status?: {
    name: string | null;
    statusCategory?: {
      name: string | null;
      colorName: string | null;
    };
  } | null;
  priority?: {
    name: string | null;
    iconUrl?: string | null;
  } | null;
  assignee?: User | null;
  reporter?: User | null;
  created?: string | null;
  updated?: string | null;
  labels?: string[] | null;
  [key: string]: unknown;
}

/**
 * JIRA user representation
 */
export interface User {
  displayName: string | null;
  emailAddress?: string | null;
  accountId: string;
  avatarUrls?: {
    [key: string]: string;
  } | null;
}

/**
 * JIRA comment representation
 */
export interface Comment {
  id: string;
  self: string;
  author: User;
  body: ADFDocument | ADFNode | string | null;
  updateAuthor?: User | null;
  created: string;
  updated: string;
  visibility?: {
    type: string;
    value: string;
  } | null;
  jsdPublic?: boolean | null;
}

/**
 * Comment retrieval options for API requests
 */
export interface GetCommentsOptions {
  maxComments?: number;
  startAt?: number;
  orderBy?: 'created' | 'updated';
  expand?: string[];
}

/**
 * Comments response structure returned by JIRA comments endpoint
 */
export interface CommentsResult {
  startAt: number;
  maxResults: number;
  total: number;
  comments: Comment[];
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
