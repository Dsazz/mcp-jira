/**
 * Issue Repository Tests
 * Comprehensive test suite for IssueRepository using Hybrid Testing Architecture
 * Tests CRUD operations, error handling, and HTTP client integration
 */

import { beforeEach, describe, expect, it, jest } from "bun:test";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { Issue, IssueUpdateRequest } from "@features/jira/issues/models";
import { IssueRepositoryImpl } from "@features/jira/issues/repositories/issue.repository";
import type { CreateIssueRequest } from "@features/jira/issues/use-cases";

// Mock Factory for Repository Tests
const IssueRepositoryMockFactory = {
  createMockHttpClient(): HttpClient {
    return {
      sendRequest: jest.fn(),
    } as unknown as HttpClient;
  },

  createMockIssue(overrides: Partial<Issue> = {}): Issue {
    return {
      key: "TEST-123",
      id: "10001",
      self: "https://jira.example.com/rest/api/3/issue/10001",
      fields: {
        summary: "Test Issue",
        description: null,
        issuetype: {
          name: "Bug",
          iconUrl: "https://example.com/bug.png",
        },
        status: {
          name: "Open",
          statusCategory: {
            name: "To Do",
            colorName: "blue-gray",
          },
        },
        priority: {
          name: "Medium",
        },
        assignee: {
          accountId: "user123",
          displayName: "John Doe",
          emailAddress: "john@example.com",
          avatarUrls: {
            "48x48": "https://example.com/avatar.png",
          },
        },
        reporter: {
          accountId: "user456",
          displayName: "Jane Reporter",
          emailAddress: "jane@example.com",
          avatarUrls: {
            "48x48": "https://example.com/reporter.png",
          },
        },
        created: "2023-01-01T00:00:00.000Z",
        updated: "2023-01-02T00:00:00.000Z",
        labels: ["bug", "urgent"],
        components: [
          {
            name: "Frontend",
          },
        ],
        fixVersions: [
          {
            name: "1.0.0",
          },
        ],
      },
      ...overrides,
    };
  },

  createMockCreateIssueRequest(
    overrides: Partial<CreateIssueRequest> = {},
  ): CreateIssueRequest {
    return {
      fields: {
        project: {
          key: "TEST",
        },
        summary: "New test issue",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "New test description",
                },
              ],
            },
          ],
        },
        issuetype: {
          name: "Bug",
        },
        priority: {
          name: "High",
        },
        assignee: {
          accountId: "user123",
        },
        labels: ["test"],
        components: [
          {
            name: "Backend",
          },
        ],
        ...overrides.fields,
      },
      ...overrides,
    };
  },

  createMockIssueUpdateRequest(
    overrides: Partial<IssueUpdateRequest> = {},
  ): IssueUpdateRequest {
    return {
      fields: {
        summary: "Updated summary",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Updated description",
                },
              ],
            },
          ],
        },
        priority: {
          name: "Low",
        },
        assignee: {
          accountId: "user789",
        },
        labels: ["updated"],
        ...overrides.fields,
      },
      ...overrides,
    };
  },

  createMockCreateIssueResponse() {
    return {
      key: "TEST-124",
      id: "10002",
    };
  },
};

describe("IssueRepositoryImpl", () => {
  let repository: IssueRepositoryImpl;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = IssueRepositoryMockFactory.createMockHttpClient();
    repository = new IssueRepositoryImpl(mockHttpClient);
  });

  describe("getIssue", () => {
    it("should get issue successfully without fields parameter", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const mockIssue = IssueRepositoryMockFactory.createMockIssue({
        key: issueKey,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockIssue);

      // Act
      const result = await repository.getIssue(issueKey);

      // Assert
      expect(result).toEqual(mockIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {},
      });
    });

    it("should get issue successfully with fields parameter", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const fields = ["summary", "description", "status"];
      const mockIssue = IssueRepositoryMockFactory.createMockIssue({
        key: issueKey,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockIssue);

      // Act
      const result = await repository.getIssue(issueKey, fields);

      // Assert
      expect(result).toEqual(mockIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {
          fields: "summary,description,status",
        },
      });
    });

    it("should handle empty fields array", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const fields: string[] = [];
      const mockIssue = IssueRepositoryMockFactory.createMockIssue({
        key: issueKey,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockIssue);

      // Act
      const result = await repository.getIssue(issueKey, fields);

      // Assert
      expect(result).toEqual(mockIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {},
      });
    });

    it("should propagate HTTP client errors", async () => {
      // Arrange
      const issueKey = "INVALID-123";
      const error = new Error("Issue not found");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.getIssue(issueKey)).rejects.toThrow(
        "Issue not found",
      );
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {},
      });
    });
  });

  describe("createIssue", () => {
    it("should create issue successfully", async () => {
      // Arrange
      const createRequest =
        IssueRepositoryMockFactory.createMockCreateIssueRequest();
      const createResponse =
        IssueRepositoryMockFactory.createMockCreateIssueResponse();
      const createdIssue = IssueRepositoryMockFactory.createMockIssue({
        key: createResponse.key,
        id: createResponse.id,
      });

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(createResponse) // First call for creation
        .mockResolvedValueOnce(createdIssue); // Second call for fetching

      // Act
      const result = await repository.createIssue(createRequest);

      // Assert
      expect(result).toEqual(createdIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.sendRequest).toHaveBeenNthCalledWith(1, {
        endpoint: "issue",
        method: "POST",
        body: createRequest,
      });
      expect(mockHttpClient.sendRequest).toHaveBeenNthCalledWith(2, {
        endpoint: `issue/${createResponse.key}`,
        method: "GET",
        queryParams: {},
      });
    });

    it("should handle creation failure", async () => {
      // Arrange
      const createRequest =
        IssueRepositoryMockFactory.createMockCreateIssueRequest();
      const error = new Error("Project not found");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.createIssue(createRequest)).rejects.toThrow(
        "Project not found",
      );
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: "issue",
        method: "POST",
        body: createRequest,
      });
    });

    it("should handle fetch failure after successful creation", async () => {
      // Arrange
      const createRequest =
        IssueRepositoryMockFactory.createMockCreateIssueRequest();
      const createResponse =
        IssueRepositoryMockFactory.createMockCreateIssueResponse();
      const fetchError = new Error("Failed to fetch created issue");

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(createResponse) // Creation succeeds
        .mockRejectedValueOnce(fetchError); // Fetch fails

      // Act & Assert
      await expect(repository.createIssue(createRequest)).rejects.toThrow(
        "Failed to fetch created issue",
      );
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe("updateIssue", () => {
    it("should update issue successfully", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const updateRequest =
        IssueRepositoryMockFactory.createMockIssueUpdateRequest();
      const updatedIssue = IssueRepositoryMockFactory.createMockIssue({
        key: issueKey,
        fields: {
          ...IssueRepositoryMockFactory.createMockIssue().fields,
          summary:
            (updateRequest.fields?.summary as string) || "Updated summary",
        },
      });

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(undefined) // Update call returns void
        .mockResolvedValueOnce(updatedIssue); // Fetch call returns updated issue

      // Act
      const result = await repository.updateIssue(issueKey, updateRequest);

      // Assert
      expect(result).toEqual(updatedIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(2);
      expect(mockHttpClient.sendRequest).toHaveBeenNthCalledWith(1, {
        endpoint: `issue/${issueKey}`,
        method: "PUT",
        body: updateRequest,
      });
      expect(mockHttpClient.sendRequest).toHaveBeenNthCalledWith(2, {
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {},
      });
    });

    it("should handle update failure", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const updateRequest =
        IssueRepositoryMockFactory.createMockIssueUpdateRequest();
      const error = new Error("Issue not found");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.updateIssue(issueKey, updateRequest),
      ).rejects.toThrow("Issue not found");
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "PUT",
        body: updateRequest,
      });
    });

    it("should handle fetch failure after successful update", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const updateRequest =
        IssueRepositoryMockFactory.createMockIssueUpdateRequest();
      const fetchError = new Error("Failed to fetch updated issue");

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(undefined) // Update succeeds
        .mockRejectedValueOnce(fetchError); // Fetch fails

      // Act & Assert
      await expect(
        repository.updateIssue(issueKey, updateRequest),
      ).rejects.toThrow("Failed to fetch updated issue");
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe("getIssueWithResponse", () => {
    it("should return success response when issue is found", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const mockIssue = IssueRepositoryMockFactory.createMockIssue({
        key: issueKey,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockIssue);

      // Act
      const result = await repository.getIssueWithResponse(issueKey);

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockIssue,
      });
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}`,
        method: "GET",
        queryParams: {},
      });
    });

    it("should return error response when issue is not found", async () => {
      // Arrange
      const issueKey = "INVALID-123";
      const error = new Error("Issue not found");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act
      const result = await repository.getIssueWithResponse(issueKey);

      // Assert
      expect(result).toEqual({
        success: false,
        error: "Issue not found",
      });
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const error = "String error";

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act
      const result = await repository.getIssueWithResponse(issueKey);

      // Assert
      expect(result).toEqual({
        success: false,
        error: "String error",
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete issue lifecycle", async () => {
      // Arrange
      const createRequest =
        IssueRepositoryMockFactory.createMockCreateIssueRequest();
      const createResponse =
        IssueRepositoryMockFactory.createMockCreateIssueResponse();
      const createdIssue = IssueRepositoryMockFactory.createMockIssue({
        key: createResponse.key,
        id: createResponse.id,
      });
      const updateRequest =
        IssueRepositoryMockFactory.createMockIssueUpdateRequest();
      const updatedIssue = IssueRepositoryMockFactory.createMockIssue({
        key: createResponse.key,
        fields: {
          ...createdIssue.fields,
          summary:
            (updateRequest.fields?.summary as string) || "Updated summary",
        },
      });

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(createResponse) // Create issue
        .mockResolvedValueOnce(createdIssue) // Fetch created issue
        .mockResolvedValueOnce(undefined) // Update issue
        .mockResolvedValueOnce(updatedIssue) // Fetch updated issue
        .mockResolvedValueOnce(updatedIssue); // Final get issue

      // Act - Create issue
      const created = await repository.createIssue(createRequest);

      // Act - Update issue
      const updated = await repository.updateIssue(created.key, updateRequest);

      // Act - Get final issue
      const final = await repository.getIssue(created.key);

      // Assert
      expect(created).toEqual(createdIssue);
      expect(updated).toEqual(updatedIssue);
      expect(final).toEqual(updatedIssue);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(5);
    });
  });
});
