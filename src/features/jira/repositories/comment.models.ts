/**
 * Comment Domain Models
 *
 * Core data structures for JIRA comment domain objects
 */

import type { ADFDocument, ADFNode } from "@features/jira/parsers/adf.parser";
import type { User } from "./user.models";

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
  orderBy?: "created" | "updated";
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
