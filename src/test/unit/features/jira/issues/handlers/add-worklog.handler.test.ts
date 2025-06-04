/**
 * AddWorklogHandler Unit Tests
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AddWorklogHandler } from "@features/jira/issues/handlers/add-worklog.handler";
import type { AddWorklogUseCase } from "@features/jira/issues/use-cases/worklog.use-cases";
import type {
  AddWorklogParams,
  DeleteWorklogParams,
  GetWorklogsParams,
  UpdateWorklogParams,
  WorklogValidator,
} from "@features/jira/issues/validators/worklog.validator";
import {
  mockWorklogEntry,
  worklogMockFactory,
} from "@test/mocks/worklog/worklog-entry.mock";
import { jiraApiMocks } from "@test/utils/mock-helpers";

describe("AddWorklogHandler", () => {
  let handler: AddWorklogHandler;
  let mockUseCase: AddWorklogUseCase;
  let mockValidator: WorklogValidator;

  beforeEach(() => {
    // Create mock use case
    mockUseCase = {
      execute: async () => ({ worklog: mockWorklogEntry }),
    };

    // Create mock validator
    mockValidator = {
      validateAddWorklogParams: (params: AddWorklogParams) => params,
      validateGetWorklogsParams: (params: GetWorklogsParams) => params,
      validateUpdateWorklogParams: (params: UpdateWorklogParams) => params,
      validateDeleteWorklogParams: (params: DeleteWorklogParams) => params,
    };

    handler = new AddWorklogHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("handle", () => {
    test("should successfully add worklog with all parameters", async () => {
      const params = {
        issueKey: "TEST-123",
        timeSpent: "2h",
        comment: "Worked on implementing new feature",
        started: "2024-01-15T09:00:00.000Z",
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should successfully add worklog with minimal parameters", async () => {
      const params = {
        issueKey: "TEST-123",
        timeSpent: "30m",
      };

      const minimalWorklog = worklogMockFactory.createWorklogEntry({
        timeSpent: "30m",
        timeSpentSeconds: 1800,
      });

      mockUseCase.execute = async () => ({ worklog: minimalWorklog });

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle validation errors", async () => {
      const params = {
        issueKey: "INVALID",
        timeSpent: "invalid-time",
      };

      mockValidator.validateAddWorklogParams = () => {
        throw new Error("Invalid time format");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid time format");
    });

    test("should handle use case errors", async () => {
      const params = {
        issueKey: "TEST-123",
        timeSpent: "2h",
      };

      mockUseCase.execute = async () => {
        throw new Error("Issue not found");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Issue not found");
    });

    test("should handle permission denied errors", async () => {
      const params = {
        issueKey: "TEST-123",
        timeSpent: "2h",
      };

      mockUseCase.execute = async () => {
        throw new Error("Forbidden - insufficient permissions");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Forbidden - insufficient permissions");
    });

    test("should handle network errors", async () => {
      const params = {
        issueKey: "TEST-123",
        timeSpent: "2h",
      };

      mockUseCase.execute = async () => {
        throw new Error("Network error");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle various time formats", async () => {
      const timeFormats = [
        { timeSpent: "1h", expectedSeconds: 3600 },
        { timeSpent: "30m", expectedSeconds: 1800 },
        { timeSpent: "1d", expectedSeconds: 28800 },
        { timeSpent: "2h 30m", expectedSeconds: 9000 },
        { timeSpent: "1w", expectedSeconds: 144000 },
      ];

      for (const format of timeFormats) {
        const params = {
          issueKey: "TEST-123",
          timeSpent: format.timeSpent,
        };

        const worklog = worklogMockFactory.createWorklogWithTime(
          format.timeSpent,
          format.expectedSeconds,
        );

        mockUseCase.execute = async () => ({ worklog });

        const result = await handler.handle(params);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      }
    });

    test("should handle empty parameters", async () => {
      mockValidator.validateAddWorklogParams = () => {
        throw new Error("Missing required parameters");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should handle null parameters", async () => {
      mockValidator.validateAddWorklogParams = () => {
        throw new Error("Invalid parameters");
      };

      const result = await handler.handle(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
