/**
 * Sprint Domain Types
 *
 * Types specific to JIRA sprint operations and data structures
 */

import type { Issue } from "./issue.models";

/**
 * JIRA Sprint representation
 */
export interface Sprint {
  id: number;
  self: string;
  state: "closed" | "active" | "future";
  name: string;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  createdDate?: string;
  originBoardId?: number;
  goal?: string;
}

/**
 * Sprint report
 */
export interface SprintReport {
  contents: {
    completedIssues: Issue[];
    issuesNotCompletedInCurrentSprint: Issue[];
    puntedIssues: Issue[];
    issuesCompletedInAnotherSprint: Issue[];
  };
  sprint: Sprint;
}

/**
 * Get sprints options
 */
export interface GetSprintsOptions {
  startAt?: number;
  maxResults?: number;
  state?: "closed" | "active" | "future";
}
