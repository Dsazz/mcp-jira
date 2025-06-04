/**
 * Issue mock factory for testing
 */
import { mock } from "bun:test";
import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type {
  IssueCommentRepository,
  IssueRepository,
  IssueSearchRepository,
  IssueTransitionRepository,
  WorklogRepository,
} from "@features/jira/issues/repositories";

/**
 * Creates a mock issue repository
 */
export function createMockIssueRepository() {
  return {
    getIssue: mock(),
    createIssue: mock(),
    updateIssue: mock(),
  } as unknown as IssueRepository;
}

/**
 * Creates a mock issue search repository
 */
export function createMockIssueSearchRepository() {
  return {
    searchIssues: mock(),
  } as unknown as IssueSearchRepository;
}

/**
 * Creates a mock issue transition repository
 */
export function createMockIssueTransitionRepository() {
  return {
    getTransitions: mock(),
    transition: mock(),
  } as unknown as IssueTransitionRepository;
}

/**
 * Creates a mock issue comment repository
 */
export function createMockIssueCommentRepository() {
  return {
    getComments: mock(),
  } as unknown as IssueCommentRepository;
}

/**
 * Creates a mock worklog repository
 */
export function createMockWorklogRepository() {
  return {
    addWorklog: mock(),
  } as unknown as WorklogRepository;
}

/**
 * Creates a mock issue
 */
export function createMockIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: "123",
    key: "TEST-123",
    self: "https://test.atlassian.net/rest/api/3/issue/123",
    fields: {
      summary: "Test Issue",
      description: "Test Description",
      issuetype: {
        name: "Task",
        iconUrl:
          "https://test.atlassian.net/secure/viewavatar?size=medium&avatarId=10318&avatarType=issuetype",
      },
      status: {
        name: "To Do",
        statusCategory: {
          name: "To Do",
          colorName: "blue-gray",
        },
      },
      creator: {
        accountId: "123456:abcdef",
        displayName: "Test User",
        active: true,
        accountType: "atlassian",
        avatarUrls: {},
        self: "https://test.atlassian.net/rest/api/3/user?accountId=123456:abcdef",
      },
      reporter: {
        accountId: "123456:abcdef",
        displayName: "Test User",
        active: true,
        accountType: "atlassian",
        avatarUrls: {},
        self: "https://test.atlassian.net/rest/api/3/user?accountId=123456:abcdef",
      },
      assignee: {
        accountId: "123456:abcdef",
        displayName: "Test User",
        active: true,
        accountType: "atlassian",
        avatarUrls: {},
        self: "https://test.atlassian.net/rest/api/3/user?accountId=123456:abcdef",
      },
      created: "2023-01-01T00:00:00.000Z",
      updated: "2023-01-01T00:00:00.000Z",
      ...overrides.fields,
    },
    ...overrides,
  };
}

/**
 * Creates a mock comment
 */
export function createMockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "1",
    body: "Test comment",
    author: {
      accountId: "123456:abcdef",
      displayName: "Test User",
      active: true,
      accountType: "atlassian",
      avatarUrls: {},
    },
    created: "2023-01-01T00:00:00.000Z",
    updated: "2023-01-01T00:00:00.000Z",
    ...overrides,
  };
}
