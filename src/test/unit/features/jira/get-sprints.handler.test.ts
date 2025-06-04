/**
 * Get Sprints Handler Tests
 * Test suite for the GetSprintsHandler
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { GetSprintsHandler } from "@features/jira/tools/handlers/get-sprints.handler";
import type { GetSprintsUseCase } from "@features/jira/issues/use-cases";
import type { SprintValidator } from "@features/jira/issues/validators";
import type { GetSprintsParams } from "@features/jira/issues/validators";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

// Setup test environment
describe("GetSprintsHandler", () => {
  // Mock dependencies
  let handler: GetSprintsHandler;
  let executeMock: ReturnType<typeof mock>;
  let validateMock: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create mock functions
    executeMock = mock(() => Promise.resolve([]));
    validateMock = mock((params: GetSprintsParams) => params);

    // Create use case and validator with mocks
    const mockUseCase: GetSprintsUseCase = {
      execute: executeMock,
    };

    const mockValidator: SprintValidator = {
      validateGetSprintsParams: validateMock,
    };

    // Setup handler with mocks
    handler = new GetSprintsHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    // Clear all mocks
    mock.restore();
  });

  describe("basic functionality", () => {
    it("should successfully retrieve and format sprints", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 123,
        startAt: 0,
        maxResults: 50,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Sprint 1",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Sprint 2",
          state: "closed",
        }),
      ];

      executeMock.mockImplementation(() => Promise.resolve(mockSprints));

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(true);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.data).toContain("Sprint 1");
      expect(result.data).toContain("Sprint 2");
      expect(result.data).toContain("active");
      expect(result.data).toContain("closed");
    });

    it("should handle empty sprint list", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 123,
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
      expect(result.data).toContain("No sprints found");
    });

    it("should filter sprints by state", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 123,
        state: "active",
        startAt: 0,
        maxResults: 50,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Active Sprint 1",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Active Sprint 2",
          state: "active",
        }),
      ];

      executeMock.mockImplementation(() => Promise.resolve(mockSprints));

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(true);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.data).toContain("Active Sprint 1");
      expect(result.data).toContain("Active Sprint 2");
      expect(result.data).toContain("active");
    });
  });

  describe("error handling", () => {
    it("should handle validation errors", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 123,
        startAt: 0,
        maxResults: 10,
      };

      const validationError = JiraApiError.withStatusCode("Invalid sprint parameters", 400,
      );
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
      expect(result.error).toContain("Invalid sprint parameters");
    });

    it("should handle not found errors", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 999, // Non-existent board
        startAt: 0,
        maxResults: 10,
      };

      executeMock.mockImplementation(() => {
        throw new JiraNotFoundError("Board", "999");
      });

      // Act
      const result = await handler.handle(params);

      // Assert
      expect(result.success).toBe(false);
      expect(validateMock).toHaveBeenCalled();
      expect(executeMock).toHaveBeenCalled();
      expect(result.error).toContain("No Sprints Found");
    });

    it("should handle permission errors", async () => {
      // Arrange
      const params: GetSprintsParams = {
        boardId: 123,
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
      const params: GetSprintsParams = {
        boardId: 123,
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
      expect(result.error).toContain("Sprint Retrieval Failed");
    });
  });
});
