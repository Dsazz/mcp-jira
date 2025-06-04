/**
 * Issue Repository Integration Tests
 *
 * Tests the repository layer with mocked HTTP responses
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { Issue } from "@features/jira/issues/models/issue.models";
import type { IssueUpdateRequest } from "@features/jira/issues/models/issue.types";
import type { CreateIssueRequest } from "@features/jira/issues/use-cases";
import { IntegrationTestEnvironment } from "@test/integration/integration-test-utils";
import { mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Set up test environment
setupTests();

describe("IssueRepository Integration", () => {
  let env: IntegrationTestEnvironment;

  beforeEach(() => {
    // Create integration test environment
    env = new IntegrationTestEnvironment();
  });

  afterEach(() => {
    // Clean up mocks
    env.reset();
  });

  describe("getIssue", () => {
    it("should retrieve an issue by key", async () => {
      // Create mock issue data
      const mockIssue: Issue = {
        id: "10001",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/10001",
        fields: {
          summary: "Test Issue",
          description: "Test Description",
          status: {
            name: "Open",
            statusCategory: {
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
            name: "Task",
            iconUrl: null,
          },
          assignee: {
            accountId: "test-user-id",
            displayName: "Test User",
          },
          created: "2024-01-01T00:00:00.000Z",
          updated: "2024-01-01T00:00:00.000Z",
        },
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", mockIssue);

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method
      const result = await repository.getIssue("TEST-123");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST-123");
      expect(result.fields?.summary).toBe("Test Issue");
    });

    it("should retrieve an issue with specific fields", async () => {
      // Create mock issue data with limited fields
      const mockIssue: Partial<Issue> = {
        id: "10001",
        key: "TEST-456",
        self: "https://test.atlassian.net/rest/api/3/issue/10001",
        fields: {
          summary: "Field-Specific Issue",
        },
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-456", mockIssue);

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method with fields parameter
      const result = await repository.getIssue("TEST-456", ["summary"]);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST-456");
      expect(result.fields?.summary).toBe("Field-Specific Issue");
    });

    it("should handle issue not found error", async () => {
      // Mock a 404 error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/NONEXIST-1",
        404,
        "Issue not found",
      );

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method and expect error
      await expect(repository.getIssue("NONEXIST-1")).rejects.toThrow();
    });

    it("should handle authentication error", async () => {
      // Mock a 401 error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/TEST-123",
        401,
        "Authentication failed",
      );

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method and expect error
      await expect(repository.getIssue("TEST-123")).rejects.toThrow(
        "Authentication failed",
      );
    });

    it("should handle network error", async () => {
      // Mock a network error
      mockHttp.mockNetworkError("/rest/api/3/issue/NETWORK-1");

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method and expect error
      await expect(repository.getIssue("NETWORK-1")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("createIssue", () => {
    it("should create a new issue", async () => {
      // Mock data for issue creation
      const createResponse = { id: "10001", key: "TEST-123" };

      // Mock the created issue that will be returned after creation
      const createdIssue: Issue = {
        id: "10001",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/10001",
        fields: {
          summary: "New Test Issue",
          description: "Created from integration test",
          status: {
            name: "Open",
            statusCategory: {
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
            name: "Task",
            iconUrl: null,
          },
        },
      };

      // Create request data
      const createRequest: CreateIssueRequest = {
        projectKey: "TEST",
        summary: "New Test Issue",
        description: "Created from integration test",
        issueType: "Task",
      };

      // Mock the create response and subsequent get response
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue", createResponse);
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", createdIssue);

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method
      const result = await repository.createIssue(createRequest);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST-123");
      expect(result.fields?.summary).toBe("New Test Issue");
    });

    it("should handle error during issue creation", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue",
        400,
        "Invalid field value",
      );

      // Create request data
      const createRequest: CreateIssueRequest = {
        projectKey: "INVALID",
        summary: "Will Fail",
        description: "This should fail with validation error",
        issueType: "Task",
      };

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method and expect error
      await expect(repository.createIssue(createRequest)).rejects.toThrow();
    });
  });

  describe("updateIssue", () => {
    it("should update an existing issue", async () => {
      // Mock the updated issue that will be returned after update
      const updatedIssue: Issue = {
        id: "10001",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/10001",
        fields: {
          summary: "Updated Test Issue",
          description: "Updated from integration test",
          status: {
            name: "Open",
            statusCategory: {
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
            name: "Task",
            iconUrl: null,
          },
        },
      };

      // Create update request
      const updateRequest: IssueUpdateRequest = {
        fields: {
          summary: "Updated Test Issue",
          description: "Updated from integration test",
        },
      };

      // Mock the update response (void) and subsequent get response
      // First mock the PUT method (returns void)
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", {});

      // Then mock the GET response that happens after the update
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", updatedIssue);

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method
      const result = await repository.updateIssue("TEST-123", updateRequest);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST-123");
      expect(result.fields?.summary).toBe("Updated Test Issue");
      expect(result.fields?.description).toBe("Updated from integration test");
    });

    it("should handle error during issue update", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/INVALID-123",
        404,
        "Issue not found",
      );

      // Create update request
      const updateRequest: IssueUpdateRequest = {
        fields: {
          summary: "Will Fail",
        },
      };

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method and expect error
      await expect(
        repository.updateIssue("INVALID-123", updateRequest),
      ).rejects.toThrow();
    });
  });

  describe("getIssueWithResponse", () => {
    it("should retrieve an issue with success response wrapper", async () => {
      // Create mock issue data
      const mockIssue: Issue = {
        id: "10001",
        key: "TEST-123",
        self: "https://test.atlassian.net/rest/api/3/issue/10001",
        fields: {
          summary: "Test Issue",
          description: "Test Description",
          status: {
            name: "Open",
          },
        },
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/issue/TEST-123", mockIssue);

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method
      const result = await repository.getIssueWithResponse("TEST-123");

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.success && result.data) {
        expect(result.data.key).toBe("TEST-123");
        expect(result.data.fields?.summary).toBe("Test Issue");
      }
    });

    it("should return error response wrapper when issue not found", async () => {
      // Mock a 404 error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/issue/NONEXIST-1",
        404,
        "Issue not found",
      );

      // Get repository from environment
      const repository = env.createIssueRepository();

      // Execute the repository method
      const result = await repository.getIssueWithResponse("NONEXIST-1");

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Issue not found");
    });
  });
});
