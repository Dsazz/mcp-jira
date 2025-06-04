/**
 * Get Boards Handler Tests
 * Comprehensive test suite for the GetBoardsHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { GetBoardsHandler } from "@features/jira/boards/tools/get-boards.handler";
import type { GetBoardsUseCase } from "@features/jira/issues/use-cases";
import type { BoardValidator } from "@features/jira/issues/validators";
import type { GetBoardsParams } from "@features/jira/issues/validators";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetBoardsHandler", () => {
  // Mock dependencies
  let handler: GetBoardsHandler;
  let executeMock: ReturnType<typeof mock>;
  let validateMock: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mock functions
    executeMock = mock(() => Promise.resolve([]));
    validateMock = mock((params: GetBoardsParams) => params);

    // Create use case and validator with mocks
    const mockUseCase: GetBoardsUseCase = {
      execute: executeMock,
    };

    const mockValidator: BoardValidator = {
      validateGetBoardsParams: validateMock,
    };

    // Setup handler with mocks
    handler = new GetBoardsHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    // Clear all mocks
    mock.restore();
  });

  describe("basic functionality", () => {
    it("should successfully retrieve and format boards", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 50,
      };

      const mockBoards = [
        mockFactory.createMockBoard({
          id: 1,
          name: "Scrum Board",
          type: "scrum",
        }),
        mockFactory.createMockBoard({
          id: 2,
          name: "Kanban Board",
          type: "kanban",
        }),
      ];

      executeMock.mockImplementation(() => Promise.resolve(mockBoards));

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(true);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.data).toContain("Scrum Board");
      expect(result.data).toContain("Kanban Board");
    });

    it("should handle empty board list", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 50,
      };

      // Already returns empty array

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(true);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.data).toContain("No boards found");
    });
  });

  describe("error handling", () => {
    it("should handle validation errors", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 10,
      };

      const validationError = JiraApiError.withStatusCode("Invalid board type", 400);
      validateMock.mockImplementation(() => {
        throw validationError;
      });

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(false);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).not.toHaveBeenCalled();
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("Invalid board type");
    });

    it("should handle not found errors", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 10,
      };

      executeMock.mockImplementation(() => {
        throw new JiraNotFoundError("Boards", "not-found");
      });

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(false);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.error).toContain("No Boards Found");
    });

    it("should handle permission errors", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 10,
      };

      executeMock.mockImplementation(() => {
        throw new JiraPermissionError("Permission denied");
      });

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(false);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.error).toContain("Permission Denied");
    });

    it("should handle generic errors", async () => {
      // Arrange
      const params: GetBoardsParams = {
        startAt: 0,
        maxResults: 10,
      };

      executeMock.mockImplementation(() => {
        throw new Error("Unknown error");
      });

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(false);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.error).toContain("Board Retrieval Failed");
    });
  });
});
