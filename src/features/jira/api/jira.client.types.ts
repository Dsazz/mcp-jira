/**
 * JIRA API Client Interface
 *
 * Defines the contract for JIRA clients
 */

import type { CreateIssueRequest } from "../api/jira.schemas";
import type { Comment, GetCommentsOptions, Issue } from "./jira.models.types";
import type {
  IssueResponse,
  IssuesResponse,
  NewIssueResponse,
} from "./jira.responses.types";

/**
 * Issue update request structure for comprehensive issue updates
 */
export interface IssueUpdateRequest {
  fields?: Record<string, unknown>;
  update?: Record<string, unknown>;
  transition?: {
    id: string;
  };
  notifyUsers?: boolean;
}

/**
 * JIRA workflow transition representation
 */
export interface Transition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
    statusCategory: {
      id: number;
      name: string;
      colorName: string;
    };
  };
  hasScreen?: boolean;
  isGlobal?: boolean;
  isInitial?: boolean;
  isConditional?: boolean;
  fields?: Record<string, unknown>;
}

/**
 * Worklog entry for time tracking
 */
export interface WorklogEntry {
  id?: string;
  self?: string;
  author?: {
    accountId: string;
    displayName: string;
  };
  timeSpent: string;
  timeSpentSeconds?: number;
  comment?: string;
  started?: string;
  created?: string;
  updated?: string;
}

/**
 * JIRA project representation
 */
export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  simplified?: boolean;
  style?: string;
  isPrivate?: boolean;
  properties?: Record<string, unknown>;
  entityId?: string;
  uuid?: string;
  lead?: {
    accountId: string;
    displayName: string;
    emailAddress?: string;
  };
  components?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  versions?: Array<{
    id: string;
    name: string;
    description?: string;
    archived?: boolean;
    released?: boolean;
    releaseDate?: string;
  }>;
  roles?: Record<string, string>;
  avatarUrls?: {
    "16x16"?: string;
    "24x24"?: string;
    "32x32"?: string;
    "48x48"?: string;
  };
  projectCategory?: {
    id: string;
    name: string;
    description?: string;
  };
  issueTypes?: Array<{
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    subtask: boolean;
  }>;
}

/**
 * Project search and filtering options
 */
export interface GetProjectsOptions {
  expand?: string[];
  recent?: number;
  properties?: string[];
  typeKey?: string;
  categoryId?: number;
  searchQuery?: string;
  orderBy?:
    | "category"
    | "issueCount"
    | "key"
    | "lastIssueUpdatedTime"
    | "name"
    | "owner"
    | "archivedDate"
    | "deletedDate";
  maxResults?: number;
  startAt?: number;
}

/**
 * Project permissions for permission checking
 */
export interface ProjectPermissions {
  permissions: Record<
    string,
    {
      id: string;
      key: string;
      name: string;
      type: string;
      description: string;
      havePermission: boolean;
    }
  >;
}

/**
 * JIRA board representation for agile workflows
 */
export interface Board {
  id: number;
  self: string;
  name: string;
  type: "scrum" | "kanban" | "simple";
  admins?: {
    users?: Array<{
      accountId: string;
      displayName: string;
    }>;
    groups?: Array<{
      name: string;
    }>;
  };
  location?: {
    projectId?: number;
    projectKey?: string;
    projectName?: string;
    projectTypeKey?: string;
    avatarURI?: string;
    displayName?: string;
  };
  canEdit?: boolean;
  isPrivate?: boolean;
  favourite?: boolean;
}

/**
 * Board configuration details
 */
export interface BoardConfiguration {
  id: number;
  name: string;
  type: string;
  self: string;
  location: {
    type: string;
    projectKeyOrId?: string;
  };
  filter: {
    id: string;
    self: string;
  };
  subQuery?: {
    query: string;
  };
  columnConfig: {
    columns: Array<{
      name: string;
      statuses: Array<{
        id: string;
        self: string;
      }>;
      min?: number;
      max?: number;
    }>;
    constraintType?: string;
  };
  estimation?: {
    type: string;
    field: {
      fieldId: string;
      displayName: string;
    };
  };
  ranking?: {
    rankCustomFieldId: number;
  };
}

/**
 * Board filtering and search options
 */
export interface GetBoardsOptions {
  startAt?: number;
  maxResults?: number;
  type?: "scrum" | "kanban" | "simple";
  name?: string;
  projectKeyOrId?: string;
  accountIdLocation?: string;
  projectLocation?: string;
  includePrivate?: boolean;
  negateLocationFiltering?: boolean;
  orderBy?: "name" | "-name" | "favourite" | "-favourite";
  expand?: string;
  filterId?: number;
}

/**
 * JIRA sprint representation for agile workflows
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
 * Sprint filtering and search options
 */
export interface GetSprintsOptions {
  startAt?: number;
  maxResults?: number;
  state?: "closed" | "active" | "future";
}

/**
 * Sprint report with analytics and metrics
 */
export interface SprintReport {
  contents: {
    completedIssues: Array<{
      id: string;
      key: string;
      summary: string;
      typeName: string;
      typeId: string;
      statusName: string;
      statusId: string;
      estimateStatistic?: {
        statFieldValue?: {
          value: number;
        };
      };
      trackingStatistic?: {
        statFieldValue?: {
          value: number;
        };
      };
    }>;
    issuesNotCompletedInCurrentSprint: Array<{
      id: string;
      key: string;
      summary: string;
      typeName: string;
      typeId: string;
      statusName: string;
      statusId: string;
      estimateStatistic?: {
        statFieldValue?: {
          value: number;
        };
      };
      trackingStatistic?: {
        statFieldValue?: {
          value: number;
        };
      };
    }>;
    puntedIssues: Array<{
      id: string;
      key: string;
      summary: string;
      typeName: string;
      typeId: string;
      statusName: string;
      statusId: string;
    }>;
    issuesCompletedInAnotherSprint: Array<{
      id: string;
      key: string;
      summary: string;
      typeName: string;
      typeId: string;
      statusName: string;
      statusId: string;
    }>;
  };
  sprint: Sprint;
}

/**
 * High-level interface for interacting with JIRA
 */
export interface JiraApiClient {
  /**
   * Get details of a specific issue
   * @param issueKey - The issue key (e.g., "PROJECT-123")
   * @param fields - Optional fields to retrieve
   * @returns Promise resolving to the issue
   */
  getIssue(issueKey: string, fields?: string[]): Promise<Issue>;

  /**
   * Get comments for a specific issue
   * @param issueKey - The issue key (e.g., "PROJECT-123")
   * @param options - Optional comment retrieval options
   * @returns Promise resolving to the comments array
   */
  getIssueComments(
    issueKey: string,
    options?: GetCommentsOptions,
  ): Promise<Comment[]>;

  /**
   * Get details of a specific issue with response wrapper
   * @param issueKey - The issue key
   * @returns Promise resolving to the response object
   */
  getIssueWithResponse(issueKey: string): Promise<IssueResponse>;

  /**
   * Search for issues using JQL
   * @param jql - JQL query string
   * @param fields - Optional fields to retrieve
   * @param maxResults - Maximum number of results to return
   * @returns Promise resolving to the issues array
   */
  searchIssues(
    jql: string,
    fields?: string[],
    maxResults?: number,
  ): Promise<Issue[]>;

  /**
   * Get issues assigned to the current user
   * @param fields - Optional fields to retrieve
   * @returns Promise resolving to the issues array
   */
  getAssignedIssues(fields?: string[]): Promise<Issue[]>;

  /**
   * Get assigned issues with response wrapper
   * @returns Promise resolving to the response object
   */
  getAssignedIssuesWithResponse(): Promise<IssuesResponse>;

  /**
   * Create a new issue
   * @param projectKey - Project key
   * @param summary - Issue summary
   * @param issueType - Issue type
   * @param description - Issue description
   * @param additionalFields - Additional fields for the issue
   * @returns Promise resolving to the new issue response
   */
  createIssue(
    projectKey: string,
    summary: string,
    issueType?: string,
    description?: string,
    additionalFields?: Record<string, unknown>,
  ): Promise<NewIssueResponse>;

  /**
   * Create a new issue with comprehensive parameters
   * @param issueData - Complete issue creation data
   * @returns Promise resolving to the created issue
   */
  createIssueWithParams(issueData: CreateIssueRequest): Promise<Issue>;

  /**
   * Validate that a project exists and user has CREATE_ISSUES permission
   * @param projectKey - Project key to validate
   * @returns Promise resolving to validation result
   */
  validateProject(projectKey: string): Promise<boolean>;

  /**
   * Get available issue types for a project
   * @param projectKey - Project key
   * @returns Promise resolving to available issue types
   */
  getIssueTypes(projectKey: string): Promise<string[]>;

  /**
   * Validate that an issue type is available for a project
   * @param projectKey - Project key
   * @param issueType - Issue type to validate
   * @returns Promise resolving to validation result
   */
  validateIssueType(projectKey: string, issueType: string): Promise<boolean>;

  /**
   * Update an existing issue with comprehensive field and transition support
   * @param issueKey - The issue key to update
   * @param updates - Update request with fields, transitions, and options
   * @returns Promise resolving to the updated issue
   */
  updateIssue(issueKey: string, updates: IssueUpdateRequest): Promise<Issue>;

  /**
   * Get available transitions for an issue
   * @param issueKey - The issue key
   * @returns Promise resolving to available transitions
   */
  getIssueTransitions(issueKey: string): Promise<Transition[]>;

  /**
   * Transition an issue to a new status
   * @param issueKey - The issue key
   * @param transitionId - The transition ID to execute
   * @param fields - Optional fields to update during transition
   * @returns Promise resolving when transition is complete
   */
  transitionIssue(
    issueKey: string,
    transitionId: string,
    fields?: Record<string, unknown>,
  ): Promise<void>;

  /**
   * Add a worklog entry to an issue for time tracking
   * @param issueKey - The issue key
   * @param timeSpent - Time spent (e.g., "2h", "30m", "1d 4h")
   * @param comment - Optional comment for the worklog
   * @param started - Optional start time (ISO string)
   * @returns Promise resolving to the created worklog entry
   */
  addWorklog(
    issueKey: string,
    timeSpent: string,
    comment?: string,
    started?: string,
  ): Promise<WorklogEntry>;

  /**
   * Get all projects accessible to the current user
   * @param options - Optional filtering and expansion options
   * @returns Promise resolving to the projects array
   */
  getProjects(options?: GetProjectsOptions): Promise<Project[]>;

  /**
   * Get details of a specific project
   * @param projectKey - The project key or ID
   * @param expand - Optional fields to expand
   * @returns Promise resolving to the project details
   */
  getProject(projectKey: string, expand?: string[]): Promise<Project>;

  /**
   * Get permissions for a specific project
   * @param projectKey - The project key
   * @returns Promise resolving to project permissions
   */
  getProjectPermissions(projectKey: string): Promise<ProjectPermissions>;

  /**
   * Search projects by name or key
   * @param query - Search query string
   * @param maxResults - Maximum number of results
   * @returns Promise resolving to matching projects
   */
  searchProjects(query: string, maxResults?: number): Promise<Project[]>;

  /**
   * Get all boards accessible to the current user
   * @param options - Optional filtering and expansion options
   * @returns Promise resolving to the boards array
   */
  getBoards(options?: GetBoardsOptions): Promise<Board[]>;

  /**
   * Get details of a specific board
   * @param boardId - The board ID
   * @returns Promise resolving to the board details
   */
  getBoard(boardId: number): Promise<Board>;

  /**
   * Get configuration details for a specific board
   * @param boardId - The board ID
   * @returns Promise resolving to the board configuration
   */
  getBoardConfiguration(boardId: number): Promise<BoardConfiguration>;

  /**
   * Get all sprints for a specific board
   * @param boardId - The board ID
   * @param options - Optional filtering options
   * @returns Promise resolving to the sprints array
   */
  getSprints(boardId: number, options?: GetSprintsOptions): Promise<Sprint[]>;

  /**
   * Get details of a specific sprint
   * @param sprintId - The sprint ID
   * @returns Promise resolving to the sprint details
   */
  getSprint(sprintId: number): Promise<Sprint>;

  /**
   * Get sprint report with analytics and metrics
   * @param sprintId - The sprint ID
   * @returns Promise resolving to the sprint report
   */
  getSprintReport(sprintId: number): Promise<SprintReport>;
}
