/**
 * Worklog use cases
 * TODO: Need to implement the use cases for worklog
 *
 * Types and interfaces for managing time tracking and worklog entries
 */

/**
 * Request for adding a worklog entry to an issue
 */
export interface AddWorklogRequest {
  /**
   * Amount of time spent in Jira format (e.g., "3h 30m")
   */
  timeSpent: string;

  /**
   * Optional comment describing the work done
   */
  comment?: string;

  /**
   * Optional start date/time in ISO format
   */
  started?: string;
}
