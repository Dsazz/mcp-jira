/**
 * Repository test utilities
 */
import { 
  BoardRepository,
  IssueCommentRepository,
  IssueRepository,
  IssueSearchRepository,
  IssueTransitionRepository,
  ProjectRepository,
  SprintRepository,
  UserProfileRepository,
  WorklogRepository,
} from "@features/jira/shared/repositories";

import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { Transition } from "@features/jira/issues/models/issue.types";
import type { Project } from "@features/jira/projects/models";
import type { WorklogEntry } from "@features/jira/issues/models/worklog.types";
import type { 
  CreateIssueRequest,
  CreateIssueResponse,
  UpdateIssueRequest
} from "@features/jira/shared/use-cases";

import { 
  ProjectPermissionChecker,
  ProjectValidator,
} from "@features/jira/shared/validators";

import { mock } from "bun:test";

/**
 * Creates a mock board repository
 */
export function createMockBoardRepository() {
  return {
    getBoards: mock(),
  } as BoardRepository & Record<keyof BoardRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue repository
 */
export function createMockIssueRepository() {
  return {
    getIssue: mock(),
    createIssue: mock(),
    updateIssue: mock(),
  } as IssueRepository & Record<keyof IssueRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue search repository
 */
export function createMockIssueSearchRepository() {
  return {
    searchIssues: mock(),
  } as IssueSearchRepository & Record<keyof IssueSearchRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue transition repository
 */
export function createMockIssueTransitionRepository() {
  return {
    getTransitions: mock(),
    transition: mock(),
  } as IssueTransitionRepository & Record<keyof IssueTransitionRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue comment repository
 */
export function createMockIssueCommentRepository() {
  return {
    getComments: mock(),
  } as IssueCommentRepository & Record<keyof IssueCommentRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock project repository
 */
export function createMockProjectRepository() {
  return {
    getProjects: mock(),
  } as ProjectRepository & Record<keyof ProjectRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock sprint repository
 */
export function createMockSprintRepository() {
  return {
    getSprints: mock(),
  } as SprintRepository & Record<keyof SprintRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock user profile repository
 */
export function createMockUserProfileRepository() {
  return {
    getCurrentUser: mock(),
  } as UserProfileRepository & Record<keyof UserProfileRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock worklog repository
 */
export function createMockWorklogRepository() {
  return {
    addWorklog: mock(),
  } as WorklogRepository & Record<keyof WorklogRepository, ReturnType<typeof mock>>;
}
