/**
 * Integration Test Utilities
 *
 * Provides utilities for integration testing with real repositories and mocked HTTP
 */
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import {
  BoardRepositoryImpl,
  IssueCommentRepositoryImpl,
  IssueRepositoryImpl,
  IssueSearchRepositoryImpl,
  ProjectRepositoryImpl,
  SprintRepositoryImpl,
  UserProfileRepositoryImpl,
  WorklogRepositoryImpl,
} from "@features/jira/repositories";
import { mockHttp } from "@test/utils/mock-helpers";

/**
 * Integration test environment with real repositories and mocked HTTP
 */
export class IntegrationTestEnvironment {
  private httpClient: HttpClient;

  /**
   * Create integration test environment with mocked HTTP client
   * but real repository implementations
   */
  constructor() {
    // Create HTTP client that uses mocked fetch
    this.httpClient = {
      sendRequest: async (options) => {
        const url =
          typeof options.endpoint === "string"
            ? options.endpoint.startsWith("/")
              ? options.endpoint
              : `/${options.endpoint}`
            : "/unknown-endpoint";

        try {
          const response = await fetch(url);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          return response.json();
        } catch (error) {
          console.error(
            `[IntegrationTest] Error sending request to ${url}:`,
            error,
          );
          throw error;
        }
      },
    };

    // Ensure we have a clean mock environment
    mockHttp.clearAllMocks();
  }

  /**
   * Reset all mocks after tests
   */
  reset() {
    mockHttp.clearAllMocks();
  }

  /**
   * Create a real IssueCommentRepository with mocked HTTP
   */
  createIssueCommentRepository() {
    return new IssueCommentRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real IssueRepository with mocked HTTP
   */
  createIssueRepository() {
    return new IssueRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real ProjectRepository with mocked HTTP
   */
  createProjectRepository() {
    return new ProjectRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real BoardRepository with mocked HTTP
   */
  createBoardRepository() {
    return new BoardRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real SprintRepository with mocked HTTP
   */
  createSprintRepository() {
    return new SprintRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real IssueSearchRepository with mocked HTTP
   */
  createIssueSearchRepository() {
    return new IssueSearchRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real WorklogRepository with mocked HTTP
   */
  createWorklogRepository() {
    return new WorklogRepositoryImpl(this.httpClient);
  }

  /**
   * Create a real UserProfileRepository with mocked HTTP
   */
  createUserProfileRepository() {
    return new UserProfileRepositoryImpl(this.httpClient);
  }
}
