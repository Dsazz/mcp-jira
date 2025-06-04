import { mock } from "bun:test";
/**
 * Repository test utilities
 */
import type { BoardRepository } from "@features/jira/boards/repositories";
import type {
  IssueCommentRepository,
  WorklogRepository,
} from "@features/jira/issues/repositories";
import type { IssueRepository } from "@features/jira/issues/repositories";
import type { IssueSearchRepository } from "@features/jira/issues/repositories";
import type { IssueTransitionRepository } from "@features/jira/issues/repositories";
import type { ProjectRepository } from "@features/jira/projects/repositories";
import type { SprintRepository } from "@features/jira/sprints/repositories";
import type { UserProfileRepository } from "@features/jira/users/repositories/user-profile.repository";

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
  } as IssueSearchRepository &
    Record<keyof IssueSearchRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue transition repository
 */
export function createMockIssueTransitionRepository() {
  return {
    getIssueTransitions: mock(),
    transitionIssue: mock(),
  } as IssueTransitionRepository &
    Record<keyof IssueTransitionRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock issue comment repository
 */
export function createMockIssueCommentRepository() {
  return {
    getIssueComments: mock(),
  } as IssueCommentRepository &
    Record<keyof IssueCommentRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock project repository
 */
export function createMockProjectRepository() {
  return {
    getProjects: mock(),
  } as ProjectRepository &
    Record<keyof ProjectRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock sprint repository
 */
export function createMockSprintRepository() {
  return {
    getSprints: mock(),
  } as SprintRepository &
    Record<keyof SprintRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock user profile repository
 */
export function createMockUserProfileRepository() {
  return {
    getCurrentUser: mock(),
  } as UserProfileRepository &
    Record<keyof UserProfileRepository, ReturnType<typeof mock>>;
}

/**
 * Creates a mock worklog repository
 */
export function createMockWorklogRepository() {
  return {
    addWorklog: mock(),
  } as WorklogRepository &
    Record<keyof WorklogRepository, ReturnType<typeof mock>>;
}
