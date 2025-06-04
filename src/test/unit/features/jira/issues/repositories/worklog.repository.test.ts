/**
 * Worklog Repository Tests
 * Comprehensive test suite for WorklogRepository using Hybrid Testing Architecture
 * Tests CRUD operations, error handling, and HTTP client integration
 */

import { beforeEach, describe, expect, it, jest } from "bun:test";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { WorklogEntry } from "@features/jira/issues/models";
import { WorklogRepositoryImpl } from "@features/jira/issues/repositories/worklog.repository";

// Mock Factory for Worklog Repository Tests
const WorklogRepositoryMockFactory = {
  createMockHttpClient(): HttpClient {
    return {
      sendRequest: jest.fn(),
    } as unknown as HttpClient;
  },

  createMockWorklogEntry(overrides: Partial<WorklogEntry> = {}): WorklogEntry {
    return {
      id: "10001",
      self: "https://jira.example.com/rest/api/3/issue/TEST-123/worklog/10001",
      author: {
        accountId: "user123",
        displayName: "John Doe",
        emailAddress: "john@example.com",
        avatarUrls: {
          "48x48": "https://example.com/avatar.png",
        },
      },
      updateAuthor: {
        accountId: "user123",
        displayName: "John Doe",
        emailAddress: "john@example.com",
        avatarUrls: {
          "48x48": "https://example.com/avatar.png",
        },
      },
      comment: "Working on bug fix",
      created: "2023-01-01T09:00:00.000Z",
      updated: "2023-01-01T09:00:00.000Z",
      started: "2023-01-01T09:00:00.000Z",
      timeSpent: "2h",
      timeSpentSeconds: 7200,
      issueId: "10100",
      ...overrides,
    };
  },

  createMockWorklogList(count = 3): WorklogEntry[] {
    return Array.from({ length: count }, (_, index) =>
      this.createMockWorklogEntry({
        id: `1000${index + 1}`,
        timeSpent: `${index + 1}h`,
        timeSpentSeconds: (index + 1) * 3600,
        comment: `Work entry ${index + 1}`,
      }),
    );
  },

  createMockWorklogResponse(worklogs: WorklogEntry[]) {
    return {
      worklogs,
      maxResults: worklogs.length,
      total: worklogs.length,
    };
  },
};

describe("WorklogRepositoryImpl", () => {
  let repository: WorklogRepositoryImpl;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      sendRequest: jest.fn(),
    } as unknown as HttpClient;
    repository = new WorklogRepositoryImpl(mockHttpClient);
  });

  describe("addWorklog", () => {
    it("should add worklog successfully", async () => {
      const issueKey = "TEST-123";
      const timeSpent = "2h";
      const mockWorklog: WorklogEntry = {
        id: "10001",
        timeSpent,
        timeSpentSeconds: 7200,
        started: "2023-01-01T09:00:00.000Z",
      };

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      const result = await repository.addWorklog(issueKey, timeSpent);

      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: { timeSpent },
      });
    });

    it("should add worklog successfully with comment", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const timeSpent = "1h 30m";
      const comment = "Fixed critical bug in authentication";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        timeSpent,
        comment,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.addWorklog(issueKey, timeSpent, comment);

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          comment,
        },
      });
    });

    it("should add worklog successfully with comment and started date", async () => {
      // Arrange
      const issueKey = "TEST-456";
      const timeSpent = "4h";
      const comment = "Implemented new feature";
      const started = "2023-01-01T09:00:00.000Z";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        timeSpent,
        comment,
        started,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.addWorklog(
        issueKey,
        timeSpent,
        comment,
        started,
      );

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          comment,
          started,
        },
      });
    });

    it("should add worklog successfully with only started date", async () => {
      // Arrange
      const issueKey = "TEST-789";
      const timeSpent = "30m";
      const started = "2023-01-02T14:30:00.000Z";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        timeSpent,
        started,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.addWorklog(
        issueKey,
        timeSpent,
        undefined,
        started,
      );

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
          started,
        },
      });
    });

    it("should handle HTTP client errors", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const timeSpent = "1h";
      const error = new Error("Network error");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.addWorklog(issueKey, timeSpent)).rejects.toThrow(
        "Network error",
      );

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "POST",
        body: {
          timeSpent,
        },
      });
    });
  });

  describe("getWorklogs", () => {
    it("should get worklogs successfully", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const mockWorklogs =
        WorklogRepositoryMockFactory.createMockWorklogList(3);
      const mockResponse =
        WorklogRepositoryMockFactory.createMockWorklogResponse(mockWorklogs);

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getWorklogs(issueKey);

      // Assert
      expect(result).toEqual(mockWorklogs);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "GET",
      });
    });

    it("should handle empty worklog list", async () => {
      // Arrange
      const issueKey = "TEST-456";
      const mockResponse =
        WorklogRepositoryMockFactory.createMockWorklogResponse([]);

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getWorklogs(issueKey);

      // Assert
      expect(result).toEqual([]);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "GET",
      });
    });

    it("should handle single worklog entry", async () => {
      // Arrange
      const issueKey = "TEST-789";
      const mockWorklogs = [
        WorklogRepositoryMockFactory.createMockWorklogEntry(),
      ];
      const mockResponse =
        WorklogRepositoryMockFactory.createMockWorklogResponse(mockWorklogs);

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getWorklogs(issueKey);

      // Assert
      expect(result).toEqual(mockWorklogs);
      expect(result).toHaveLength(1);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "GET",
      });
    });

    it("should handle large worklog lists", async () => {
      // Arrange
      const issueKey = "TEST-LARGE";
      const mockWorklogs =
        WorklogRepositoryMockFactory.createMockWorklogList(50);
      const mockResponse =
        WorklogRepositoryMockFactory.createMockWorklogResponse(mockWorklogs);

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await repository.getWorklogs(issueKey);

      // Assert
      expect(result).toEqual(mockWorklogs);
      expect(result).toHaveLength(50);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "GET",
      });
    });

    it("should handle HTTP client errors", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const error = new Error("Permission denied");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.getWorklogs(issueKey)).rejects.toThrow(
        "Permission denied",
      );

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog`,
        method: "GET",
      });
    });
  });

  describe("updateWorklog", () => {
    it("should update worklog successfully with minimal parameters", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const worklogId = "10001";
      const timeSpent = "3h";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: worklogId,
        timeSpent,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.updateWorklog(
        issueKey,
        worklogId,
        timeSpent,
      );

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
        },
      });
    });

    it("should update worklog successfully with comment", async () => {
      // Arrange
      const issueKey = "TEST-456";
      const worklogId = "10002";
      const timeSpent = "2h 15m";
      const comment = "Updated work description";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: worklogId,
        timeSpent,
        comment,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.updateWorklog(
        issueKey,
        worklogId,
        timeSpent,
        comment,
      );

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
          comment,
        },
      });
    });

    it("should update worklog successfully with empty comment", async () => {
      // Arrange
      const issueKey = "TEST-789";
      const worklogId = "10003";
      const timeSpent = "1h";
      const comment = "";
      const mockWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: worklogId,
        timeSpent,
      });

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(mockWorklog);

      // Act
      const result = await repository.updateWorklog(
        issueKey,
        worklogId,
        timeSpent,
        comment,
      );

      // Assert
      expect(result).toEqual(mockWorklog);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
        },
      });
    });

    it("should handle HTTP client errors", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const worklogId = "10001";
      const timeSpent = "1h";
      const error = new Error("Worklog not found");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.updateWorklog(issueKey, worklogId, timeSpent),
      ).rejects.toThrow("Worklog not found");

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "PUT",
        body: {
          timeSpent,
        },
      });
    });
  });

  describe("deleteWorklog", () => {
    it("should delete worklog successfully", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const worklogId = "10001";

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(undefined);

      // Act
      await repository.deleteWorklog(issueKey, worklogId);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "DELETE",
      });
    });

    it("should handle different issue keys and worklog IDs", async () => {
      // Arrange
      const issueKey = "PROJ-456";
      const worklogId = "20002";

      (mockHttpClient.sendRequest as jest.Mock).mockResolvedValue(undefined);

      // Act
      await repository.deleteWorklog(issueKey, worklogId);

      // Assert
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "DELETE",
      });
    });

    it("should handle HTTP client errors", async () => {
      // Arrange
      const issueKey = "TEST-123";
      const worklogId = "10001";
      const error = new Error("Insufficient permissions");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.deleteWorklog(issueKey, worklogId),
      ).rejects.toThrow("Insufficient permissions");

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "DELETE",
      });
    });

    it("should handle network errors", async () => {
      // Arrange
      const issueKey = "TEST-456";
      const worklogId = "10002";
      const error = new Error("Network timeout");

      (mockHttpClient.sendRequest as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.deleteWorklog(issueKey, worklogId),
      ).rejects.toThrow("Network timeout");

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: `issue/${issueKey}/worklog/${worklogId}`,
        method: "DELETE",
      });
    });
  });

  describe("constructor", () => {
    it("should create repository instance with HTTP client", () => {
      // Arrange & Act
      const repo = new WorklogRepositoryImpl(mockHttpClient);

      // Assert
      expect(repo).toBeInstanceOf(WorklogRepositoryImpl);
    });

    it("should handle null HTTP client gracefully", () => {
      // Arrange & Act & Assert
      expect(
        () => new WorklogRepositoryImpl(null as unknown as HttpClient),
      ).not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete worklog lifecycle", async () => {
      // Arrange
      const issueKey = "TEST-LIFECYCLE";
      const timeSpent = "2h";
      const comment = "Initial work";
      const updatedTimeSpent = "3h";
      const updatedComment = "Updated work description";

      const addedWorklog = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: "10001",
        timeSpent,
        comment,
      });

      const updatedWorklog =
        WorklogRepositoryMockFactory.createMockWorklogEntry({
          id: "10001",
          timeSpent: updatedTimeSpent,
          comment: updatedComment,
        });

      const worklogList = [addedWorklog];
      const worklogResponse =
        WorklogRepositoryMockFactory.createMockWorklogResponse(worklogList);

      // Mock sequence of operations
      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(addedWorklog) // addWorklog
        .mockResolvedValueOnce(worklogResponse) // getWorklogs
        .mockResolvedValueOnce(updatedWorklog) // updateWorklog
        .mockResolvedValueOnce(undefined); // deleteWorklog

      // Act & Assert - Add worklog
      const added = await repository.addWorklog(issueKey, timeSpent, comment);
      expect(added).toEqual(addedWorklog);

      // Act & Assert - Get worklogs
      const worklogs = await repository.getWorklogs(issueKey);
      expect(worklogs).toEqual([addedWorklog]);

      // Act & Assert - Update worklog
      const updated = await repository.updateWorklog(
        issueKey,
        "10001",
        updatedTimeSpent,
        updatedComment,
      );
      expect(updated).toEqual(updatedWorklog);

      // Act & Assert - Delete worklog
      await repository.deleteWorklog(issueKey, "10001");

      // Verify all calls were made
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(4);
    });

    it("should handle multiple worklog operations in parallel", async () => {
      // Arrange
      const issueKey1 = "TEST-PARALLEL-1";
      const issueKey2 = "TEST-PARALLEL-2";
      const timeSpent = "1h";

      const worklog1 = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: "10001",
      });
      const worklog2 = WorklogRepositoryMockFactory.createMockWorklogEntry({
        id: "10002",
      });

      (mockHttpClient.sendRequest as jest.Mock)
        .mockResolvedValueOnce(worklog1)
        .mockResolvedValueOnce(worklog2);

      // Act
      const [result1, result2] = await Promise.all([
        repository.addWorklog(issueKey1, timeSpent),
        repository.addWorklog(issueKey2, timeSpent),
      ]);

      // Assert
      expect(result1).toEqual(worklog1);
      expect(result2).toEqual(worklog2);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledTimes(2);
    });
  });
});
