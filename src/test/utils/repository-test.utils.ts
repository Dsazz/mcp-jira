import { type Mock, expect, mock } from "bun:test";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type {
  BoardRepository,
  IssueCommentRepository,
  IssueRepository,
  IssueSearchRepository,
  IssueTransitionRepository,
  ProjectRepository,
  SprintRepository,
  UserProfileRepository,
  WorklogRepository,
} from "@features/jira/repositories";
import type { Issue } from "@features/jira/repositories/issue.models";
import type { Transition } from "@features/jira/repositories/issue.types";
import type { Project } from "@features/jira/repositories/project.types";
import type { WorklogEntry } from "@features/jira/repositories/worklog.types";
import type {
  CreateIssueUseCase,
  UpdateIssueUseCase,
} from "@features/jira/use-cases";
import type {
  ProjectPermissionChecker,
  ProjectValidator,
} from "@features/jira/validators";

/**
 * Mock factory for creating repository test doubles
 * Provides consistent mocking patterns for the new architecture using Bun test
 */
export namespace RepositoryMockFactory {
  /**
   * Create a mock HttpClient for repository testing
   */
  export function createMockHttpClient(): HttpClient & {
    sendRequest: Mock<() => Promise<unknown>>;
  } {
    return {
      sendRequest: mock(),
    } as HttpClient & { sendRequest: Mock<() => Promise<unknown>> };
  }

  /**
   * Create a mock IssueRepository
   */
  export function createMockIssueRepository(): IssueRepository &
    Record<keyof IssueRepository, Mock<() => Promise<unknown>>> {
    return {
      getIssue: mock(),
      createIssue: mock(),
      updateIssue: mock(),
      getIssueWithResponse: mock(),
    } as IssueRepository &
      Record<keyof IssueRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock IssueSearchRepository
   */
  export function createMockIssueSearchRepository(): IssueSearchRepository &
    Record<keyof IssueSearchRepository, Mock<() => Promise<unknown>>> {
    return {
      searchIssues: mock(),
      getAssignedIssues: mock(),
      getAssignedIssuesWithResponse: mock(),
    } as IssueSearchRepository &
      Record<keyof IssueSearchRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock IssueCommentRepository
   */
  export function createMockIssueCommentRepository(): IssueCommentRepository &
    Record<keyof IssueCommentRepository, Mock<() => Promise<unknown>>> {
    return {
      getIssueComments: mock(),
    } as IssueCommentRepository &
      Record<keyof IssueCommentRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock IssueTransitionRepository
   */
  export function createMockIssueTransitionRepository(): IssueTransitionRepository &
    Record<keyof IssueTransitionRepository, Mock<() => Promise<unknown>>> {
    return {
      getIssueTransitions: mock(),
      transitionIssue: mock(),
    } as IssueTransitionRepository &
      Record<keyof IssueTransitionRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock WorklogRepository
   */
  export function createMockWorklogRepository(): WorklogRepository &
    Record<keyof WorklogRepository, Mock<() => Promise<unknown>>> {
    return {
      addWorklog: mock(),
      getWorklogs: mock(),
      updateWorklog: mock(),
      deleteWorklog: mock(),
    } as WorklogRepository &
      Record<keyof WorklogRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock ProjectRepository
   */
  export function createMockProjectRepository(): ProjectRepository &
    Record<keyof ProjectRepository, Mock<() => Promise<unknown>>> {
    return {
      getProjects: mock(),
      getProject: mock(),
      getProjectPermissions: mock(),
      searchProjects: mock(),
    } as ProjectRepository &
      Record<keyof ProjectRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock BoardRepository
   */
  export function createMockBoardRepository(): BoardRepository &
    Record<keyof BoardRepository, Mock<() => Promise<unknown>>> {
    return {
      getBoards: mock(),
      getBoard: mock(),
      getBoardConfiguration: mock(),
    } as BoardRepository &
      Record<keyof BoardRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock SprintRepository
   */
  export function createMockSprintRepository(): SprintRepository &
    Record<keyof SprintRepository, Mock<() => Promise<unknown>>> {
    return {
      getSprints: mock(),
      getSprint: mock(),
      getSprintReport: mock(),
    } as SprintRepository &
      Record<keyof SprintRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock UserProfileRepository
   */
  export function createMockUserProfileRepository(): UserProfileRepository &
    Record<keyof UserProfileRepository, Mock<() => Promise<unknown>>> {
    return {
      getCurrentUser: mock(),
    } as UserProfileRepository &
      Record<keyof UserProfileRepository, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock ProjectValidator
   */
  export function createMockProjectValidator(): ProjectValidator &
    Record<keyof ProjectValidator, Mock<() => Promise<unknown>>> {
    return {
      validateProject: mock(),
      validateIssueType: mock(),
      getIssueTypes: mock(),
    } as ProjectValidator &
      Record<keyof ProjectValidator, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock ProjectPermissionChecker
   */
  export function createMockProjectPermissionChecker(): ProjectPermissionChecker &
    Record<keyof ProjectPermissionChecker, Mock<() => Promise<unknown>>> {
    return {
      getProjectPermissions: mock(),
      hasCreateIssuePermission: mock(),
      hasEditIssuePermission: mock(),
      hasDeleteIssuePermission: mock(),
    } as ProjectPermissionChecker &
      Record<keyof ProjectPermissionChecker, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock CreateIssueUseCase
   */
  export function createMockCreateIssueUseCase(): CreateIssueUseCase &
    Record<keyof CreateIssueUseCase, Mock<() => Promise<unknown>>> {
    return {
      execute: mock(),
    } as CreateIssueUseCase &
      Record<keyof CreateIssueUseCase, Mock<() => Promise<unknown>>>;
  }

  /**
   * Create a mock UpdateIssueUseCase
   */
  export function createMockUpdateIssueUseCase(): UpdateIssueUseCase &
    Record<keyof UpdateIssueUseCase, Mock<() => Promise<unknown>>> {
    return {
      execute: mock(),
    } as UpdateIssueUseCase &
      Record<keyof UpdateIssueUseCase, Mock<() => Promise<unknown>>>;
  }
}

/**
 * Test data factory for creating consistent test data
 * Provides realistic test data for the new architecture
 */
export namespace TestDataFactory {
  /**
   * Create a sample issue for testing
   */
  export function createSampleIssue(overrides: Partial<Issue> = {}): Issue {
    return {
      id: "10001",
      key: "TEST-123",
      self: "https://test.atlassian.net/rest/api/2/issue/10001",
      fields: {
        summary: "Test Issue",
        description: "Test Description",
        status: {
          id: "1",
          name: "Open",
          statusCategory: {
            id: 2,
            name: "To Do",
            colorName: "blue-gray",
          },
        },
        project: {
          id: "10000",
          key: "TEST",
          name: "Test Project",
        },
        issuetype: {
          id: "1",
          name: "Task",
          subtask: false,
        },
        assignee: {
          accountId: "test-user-id",
          displayName: "Test User",
        },
        created: "2024-01-01T00:00:00.000Z",
        updated: "2024-01-01T00:00:00.000Z",
        ...overrides.fields,
      },
      ...overrides,
    } as Issue;
  }

  /**
   * Create a sample project for testing
   */
  export function createSampleProject(
    overrides: Partial<Project> = {},
  ): Project {
    return {
      id: "10000",
      key: "TEST",
      name: "Test Project",
      description: "Test Project Description",
      projectTypeKey: "software",
      lead: {
        accountId: "test-user-id",
        displayName: "Test User",
      },
      issueTypes: [
        {
          id: "1",
          name: "Task",
          description: "A task that needs to be done",
          subtask: false,
        },
        {
          id: "2",
          name: "Bug",
          description: "A problem that needs to be fixed",
          subtask: false,
        },
      ],
      ...overrides,
    } as Project;
  }

  /**
   * Create sample transitions for testing
   */
  export function createSampleTransitions(): Transition[] {
    return [
      {
        id: "11",
        name: "To Do",
        to: {
          self: "https://test.atlassian.net/rest/api/2/status/1",
          description:
            "The issue is open and ready for the assignee to start work on it.",
          iconUrl: "https://test.atlassian.net/images/icons/statuses/open.png",
          id: "1",
          name: "To Do",
          statusCategory: {
            self: "https://test.atlassian.net/rest/api/2/statuscategory/2",
            id: 2,
            key: "new",
            name: "To Do",
            colorName: "blue-gray",
          },
        },
        hasScreen: false,
        isGlobal: true,
        isInitial: false,
        isAvailable: true,
        isConditional: false,
      },
      {
        id: "21",
        name: "In Progress",
        to: {
          self: "https://test.atlassian.net/rest/api/2/status/3",
          description:
            "This issue is being actively worked on at the moment by the assignee.",
          iconUrl:
            "https://test.atlassian.net/images/icons/statuses/inprogress.png",
          id: "3",
          name: "In Progress",
          statusCategory: {
            self: "https://test.atlassian.net/rest/api/2/statuscategory/4",
            id: 4,
            key: "indeterminate",
            name: "In Progress",
            colorName: "yellow",
          },
        },
        hasScreen: false,
        isGlobal: true,
        isInitial: false,
        isAvailable: true,
        isConditional: false,
      },
      {
        id: "31",
        name: "Done",
        to: {
          self: "https://test.atlassian.net/rest/api/2/status/10001",
          description: "The issue is closed and resolved.",
          iconUrl:
            "https://test.atlassian.net/images/icons/statuses/closed.png",
          id: "10001",
          name: "Done",
          statusCategory: {
            self: "https://test.atlassian.net/rest/api/2/statuscategory/3",
            id: 3,
            key: "done",
            name: "Done",
            colorName: "green",
          },
        },
        hasScreen: false,
        isGlobal: true,
        isInitial: false,
        isAvailable: true,
        isConditional: false,
      },
    ];
  }

  /**
   * Create a sample worklog entry for testing
   */
  export function createSampleWorklog(
    overrides: Partial<WorklogEntry> = {},
  ): WorklogEntry {
    return {
      id: "10000",
      self: "https://test.atlassian.net/rest/api/2/issue/10001/worklog/10000",
      author: {
        accountId: "test-user-id",
        displayName: "Test User",
      },
      timeSpent: "2h",
      timeSpentSeconds: 7200,
      comment: "Test worklog comment",
      started: "2024-01-01T09:00:00.000Z",
      created: "2024-01-01T09:00:00.000Z",
      updated: "2024-01-01T09:00:00.000Z",
      ...overrides,
    };
  }
}

/**
 * Test assertion helpers for the new architecture
 * Provides common assertion patterns for repository testing using Bun test
 */
export namespace TestAssertions {
  /**
   * Assert that a repository method was called with expected parameters
   */
  export function assertRepositoryMethodCalled<
    T extends Record<string, Mock<() => Promise<unknown>>>,
  >(repository: T, methodName: keyof T, expectedArgs: unknown[]): void {
    expect(repository[methodName]).toHaveBeenCalledWith(...expectedArgs);
  }

  /**
   * Assert that a repository method was called exactly once
   */
  export function assertRepositoryMethodCalledOnce<
    T extends Record<string, Mock<() => Promise<unknown>>>,
  >(repository: T, methodName: keyof T): void {
    expect(repository[methodName]).toHaveBeenCalledTimes(1);
  }

  /**
   * Assert that multiple repository methods were called in sequence
   */
  export function assertRepositoryMethodsCalledInOrder<
    T extends Record<string, Mock<() => Promise<unknown>>>,
  >(
    repository: T,
    methodCalls: Array<{ method: keyof T; args: unknown[] }>,
  ): void {
    methodCalls.forEach(({ method, args }, index) => {
      expect(repository[method]).toHaveBeenNthCalledWith(index + 1, ...args);
    });
  }

  /**
   * Assert that a use case executed successfully
   */
  export function assertUseCaseExecutedSuccessfully<
    T extends { execute: Mock<() => Promise<unknown>> },
  >(useCase: T, expectedRequest: unknown): void {
    expect(useCase.execute).toHaveBeenCalledWith(expectedRequest);
    expect(useCase.execute).toHaveReturned();
  }
}
