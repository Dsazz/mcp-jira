/**
 * Issue Search Repository Integration Tests
 *
 * Tests the repository layer with mocked HTTP responses
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { SearchResult } from "@features/jira/repositories/search.models";
import { IntegrationTestEnvironment } from "@test/integration/integration-test-utils";
import { mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Set up test environment
setupTests();

describe("IssueSearchRepository Integration", () => {
  let env: IntegrationTestEnvironment;

  beforeEach(() => {
    // Create integration test environment
    env = new IntegrationTestEnvironment();
  });

  afterEach(() => {
    // Clean up mocks
    env.reset();
  });

  describe("searchIssues", () => {
    it("should search for issues with JQL", async () => {
      // Create mock search results
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 2,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Test Issue 1",
              status: {
                name: "To Do",
                statusCategory: {
                  name: "To Do",
                  colorName: "blue-gray",
                },
              },
            },
          },
          {
            id: "10002",
            key: "TEST-124",
            self: "https://test.atlassian.net/rest/api/3/issue/10002",
            fields: {
              summary: "Test Issue 2",
              status: {
                name: "In Progress",
                statusCategory: {
                  name: "In Progress",
                  colorName: "yellow",
                },
              },
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method
      const result = await repository.searchIssues("project = TEST");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].key).toBe("TEST-123");
      expect(result[1].key).toBe("TEST-124");
    });

    it("should apply field filtering to search results", async () => {
      // Create mock search results with limited fields
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 1,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Test Issue with Limited Fields",
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method with field filtering
      const result = await repository.searchIssues("project = TEST", [
        "summary",
      ]);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.fields?.summary).toBe("Test Issue with Limited Fields");
      expect(result[0]?.fields?.description).toBeUndefined();
    });

    it("should limit search results based on maxResults", async () => {
      // Create mock search results
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 1,
        total: 10,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Test Issue 1",
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method with maxResults
      const result = await repository.searchIssues(
        "project = TEST",
        undefined,
        1,
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should handle empty search results", async () => {
      // Create empty mock search results
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 0,
        issues: [],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method
      const result = await repository.searchIssues("project = NONEXIST");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle error during search", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError("/rest/api/3/search", 400, "Invalid JQL query");

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method and expect error
      await expect(repository.searchIssues("invalid = query")).rejects.toThrow(
        "Invalid JQL query",
      );
    });
  });

  describe("getAssignedIssues", () => {
    it("should retrieve issues assigned to current user", async () => {
      // Create mock search results for assigned issues
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 2,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Assigned Issue 1",
              assignee: {
                accountId: "current-user",
                displayName: "Current User",
              },
            },
          },
          {
            id: "10002",
            key: "TEST-124",
            self: "https://test.atlassian.net/rest/api/3/issue/10002",
            fields: {
              summary: "Assigned Issue 2",
              assignee: {
                accountId: "current-user",
                displayName: "Current User",
              },
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method
      const result = await repository.getAssignedIssues();

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].key).toBe("TEST-123");
      expect(result[1].key).toBe("TEST-124");
    });

    it("should filter fields for assigned issues", async () => {
      // Create mock search results with limited fields
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 1,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Assigned Issue with Filtered Fields",
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method with field filtering
      const result = await repository.getAssignedIssues(["summary"]);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]?.fields?.summary).toBe(
        "Assigned Issue with Filtered Fields",
      );
    });

    it("should handle error when fetching assigned issues", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/search",
        401,
        "Authentication failed",
      );

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method and expect error
      await expect(repository.getAssignedIssues()).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("getAssignedIssuesWithResponse", () => {
    it("should retrieve assigned issues with success response wrapper", async () => {
      // Create mock search results
      const mockSearchResult: SearchResult = {
        startAt: 0,
        maxResults: 50,
        total: 1,
        issues: [
          {
            id: "10001",
            key: "TEST-123",
            self: "https://test.atlassian.net/rest/api/3/issue/10001",
            fields: {
              summary: "Assigned Issue",
              assignee: {
                accountId: "current-user",
                displayName: "Current User",
              },
            },
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/search", mockSearchResult);

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method
      const result = await repository.getAssignedIssuesWithResponse();

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].key).toBe("TEST-123");
      }
    });

    it("should return error response wrapper when fetch fails", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError("/rest/api/3/search", 500, "Server error");

      // Get repository from environment
      const repository = env.createIssueSearchRepository();

      // Execute the repository method
      const result = await repository.getAssignedIssuesWithResponse();

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Server error");
    });
  });
});
