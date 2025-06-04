/**
 * JIRA Generic API Response Types
 *
 * Contains generic response wrapper types used across JIRA API
 */

/**
 * Raw API response wrapper for generic data
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
