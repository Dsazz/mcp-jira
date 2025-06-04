/**
 * Mock Management Helpers
 * Utilities for creating and managing mocks across test suites
 */

import { type Mock, mock } from "bun:test";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { IssueSearchResult } from "@features/jira/issues/models/issue-search.models";
import { mockFactory } from "../mocks/jira-mock-factory";

interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

interface JiraErrorResponse {
  errorMessages: string[];
  errors: Record<string, unknown>;
}

type FetchMock = Mock<() => Promise<MockResponse>>;

/**
 * Mock HTTP fetch responses for JIRA API calls
 */
const mocks = new Map<string, FetchMock>();

export const mockHttp = {
  /**
   * Mock a successful JIRA API response
   */
  mockJiraApiSuccess(endpoint: string, responseData: unknown): FetchMock {
    const fetchMock = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseData),
        text: () => Promise.resolve(JSON.stringify(responseData)),
      }),
    );

    mocks.set(endpoint, fetchMock);
    (global as { fetch: unknown }).fetch = fetchMock;
    return fetchMock;
  },

  /**
   * Mock a JIRA API error response
   */
  mockJiraApiError(
    endpoint: string,
    status: number,
    message: string,
  ): FetchMock {
    const errorResponse: JiraErrorResponse = {
      errorMessages: [message],
      errors: {},
    };

    const fetchMock = mock(() =>
      Promise.resolve({
        ok: false,
        status,
        json: () => Promise.resolve(errorResponse),
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
      }),
    );

    mocks.set(endpoint, fetchMock);
    (global as { fetch: unknown }).fetch = fetchMock;
    return fetchMock;
  },

  /**
   * Mock network failure
   */
  mockNetworkError(endpoint: string): Mock<() => Promise<never>> {
    const fetchMock = mock(() => Promise.reject(new Error("Network error")));

    mocks.set(endpoint, fetchMock);
    (global as { fetch: unknown }).fetch = fetchMock;
    return fetchMock;
  },

  /**
   * Clear all HTTP mocks
   */
  clearAllMocks() {
    mocks.clear();
    (global as { fetch: unknown }).fetch = fetch; // Restore original fetch
  },

  /**
   * Get mock for specific endpoint
   */
  getMock(endpoint: string): FetchMock | undefined {
    return mocks.get(endpoint);
  },
};

/**
 * Pre-configured JIRA API mock scenarios
 */
export const jiraApiMocks = {
  /**
   * Mock get issue endpoint with sample data
   */
  mockGetIssue(issueKey: string, scenario?: string): FetchMock {
    const scenarioData = scenario ? mockFactory.getScenario(scenario) : null;
    const issue =
      scenarioData?.data.issues?.[0] ||
      mockFactory.createMockIssue({ key: issueKey });

    return mockHttp.mockJiraApiSuccess(`/rest/api/3/issue/${issueKey}`, issue);
  },

  /**
   * Mock search issues endpoint
   */
  mockSearchIssues(scenario?: string): FetchMock {
    const scenarioData = scenario ? mockFactory.getScenario(scenario) : null;
    const searchResult =
      scenarioData?.data.searchResults || mockFactory.createMockSearchResult();

    return mockHttp.mockJiraApiSuccess("/rest/api/3/search", searchResult);
  },

  /**
   * Mock get assigned issues (search with assignee = currentUser)
   */
  mockGetAssignedIssues(scenario?: string): FetchMock {
    const scenarioData = scenario ? mockFactory.getScenario(scenario) : null;
    const searchResult =
      scenarioData?.data.searchResults || mockFactory.createMockSearchResult();

    return mockHttp.mockJiraApiSuccess(
      "/rest/api/3/search?jql=assignee=currentUser()",
      searchResult,
    );
  },

  /**
   * Mock issue not found error
   */
  mockIssueNotFound(issueKey: string): FetchMock {
    return mockHttp.mockJiraApiError(
      `/rest/api/3/issue/${issueKey}`,
      404,
      `Issue Does Not Exist: ${issueKey}`,
    );
  },

  /**
   * Mock authentication error
   */
  mockAuthError(): FetchMock {
    return mockHttp.mockJiraApiError(
      "/rest/api/3/issue/TEST-1",
      401,
      "Authentication failed",
    );
  },

  /**
   * Mock permission error
   */
  mockPermissionError(issueKey: string): FetchMock {
    return mockHttp.mockJiraApiError(
      `/rest/api/3/issue/${issueKey}`,
      403,
      "Forbidden - insufficient permissions",
    );
  },

  /**
   * Mock network failure
   */
  mockNetworkError(endpoint: string): Mock<() => Promise<never>> {
    return mockHttp.mockNetworkError(endpoint);
  },

  /**
   * Mock a successful JIRA API response (direct access)
   */
  mockJiraApiSuccess(endpoint: string, responseData: unknown): FetchMock {
    return mockHttp.mockJiraApiSuccess(endpoint, responseData);
  },

  /**
   * Clear all JIRA API mocks
   */
  clearMocks() {
    mockHttp.clearAllMocks();
  },
};

/**
 * Test data builders for quick setup
 */
export const testDataBuilder = {
  /**
   * Create issue with specific status
   */
  issueWithStatus(status: string, statusColor = "blue"): Issue {
    return mockFactory.createMockIssue({
      fields: {
        ...mockFactory.createMockIssue().fields,
        status: {
          name: status,
          statusCategory: {
            name: status,
            colorName: statusColor,
          },
        },
      },
    });
  },

  /**
   * Create issue with specific priority
   */
  issueWithPriority(priority: string): Issue {
    return mockFactory.createMockIssue({
      fields: {
        ...mockFactory.createMockIssue().fields,
        priority: { name: priority },
      },
    });
  },

  /**
   * Create search result with specific count
   */
  searchResultWithCount(count: number): IssueSearchResult {
    const issues = Array.from({ length: count }, (_, i) =>
      mockFactory.createMockIssue({
        key: `TEST-${i + 1}`,
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: `Test issue ${i + 1}`,
        },
      }),
    );

    return mockFactory.createMockSearchResult({
      total: count,
      issues,
    });
  },

  /**
   * Create empty search result
   */
  emptySearchResult(): IssueSearchResult {
    return mockFactory.createMockSearchResult({
      total: 0,
      issues: [],
    });
  },
};
