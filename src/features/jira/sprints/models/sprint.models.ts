/**
 * Sprint models for the JIRA sprints domain
 */

import type { Issue } from "@features/jira/issues/models/issue.models";

/**
 * Sprint state
 */
export const SprintState = {
  FUTURE: "future",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;

export type SprintState = (typeof SprintState)[keyof typeof SprintState];

/**
 * Sprint entity representing a JIRA sprint
 */
export interface Sprint {
  id: number;
  name: string;
  state: SprintState;
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId: number;
  createdDate?: string;
  goal?: string;
  self?: string;
}

/**
 * Sprint report data
 */
export interface SprintReport {
  sprint: Sprint;
  completedIssues: Issue[];
  incompletedIssues: Issue[];
  puntedIssues: Issue[];
  completedIssuesInitialEstimateSum?: {
    value: number;
    text: string;
  };
  completedIssuesEstimateSum?: {
    value: number;
    text: string;
  };
  issuesNotCompletedEstimateSum?: {
    value: number;
    text: string;
  };
  puntedIssuesEstimateSum?: {
    value: number;
    text: string;
  };
  issueKeysAddedDuringSprint?: string[];
}

/**
 * Options for getting sprints
 */
export interface GetSprintsOptions {
  /**
   * ID of the board to get sprints from
   */
  boardId: number;

  /**
   * State of the sprints to filter by
   */
  state?: SprintState | string;

  /**
   * Pagination start index
   */
  startAt?: number;

  /**
   * Maximum number of results to return
   */
  maxResults?: number;
}
