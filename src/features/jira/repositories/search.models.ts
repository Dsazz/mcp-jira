/**
 * Search Domain Models
 *
 * Core data structures for JIRA search domain objects
 */

import type { Issue } from "./issue.models";

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
