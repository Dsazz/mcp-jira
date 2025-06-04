/**
 * GetWorklogsHandler Unit Tests
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { GetWorklogsHandler } from "@features/jira/issues/handlers/get-worklogs.handler";
import type { GetWorklogsUseCase } from "@features/jira/issues/use-cases/worklog.use-cases";
import type {
  AddWorklogParams,
  DeleteWorklogParams,
  GetWorklogsParams,
  UpdateWorklogParams,
  WorklogValidator,
} from "@features/jira/issues/validators/worklog.validator";
import {
  mockEmptyWorklogList,
  mockWorklogList,
  worklogMockFactory,
} from "@test/mocks/worklog/worklog-entry.mock";
import { jiraApiMocks } from "@test/utils/mock-helpers";

describe("GetWorklogsHandler", () => {
  let handler: GetWorklogsHandler;
  let mockUseCase: GetWorklogsUseCase;
  let mockValidator: WorklogValidator;

  beforeEach(() => {
    // Create mock use case
    mockUseCase = {
      execute: async () => ({ worklogs: mockWorklogList }),
    };

    // Create mock validator
    mockValidator = {
      validateAddWorklogParams: (params: AddWorklogParams) => params,
      validateGetWorklogsParams: (params: GetWorklogsParams) => params,
      validateUpdateWorklogParams: (params: UpdateWorklogParams) => params,
      validateDeleteWorklogParams: (params: DeleteWorklogParams) => params,
    };

    handler = new GetWorklogsHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("handle", () => {
    test("should successfully get worklogs for an issue", async () => {
      const params = {
        issueKey: "TEST-123",
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle empty worklog list", async () => {
      const params = {
        issueKey: "TEST-456",
      };

      mockUseCase.execute = async () => ({ worklogs: mockEmptyWorklogList });

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle pagination parameters", async () => {
      const params = {
        issueKey: "TEST-123",
        startAt: 0,
        maxResults: 50,
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle date filtering parameters", async () => {
      const params = {
        issueKey: "TEST-123",
        startedAfter: "2024-01-01T00:00:00.000Z",
        startedBefore: "2024-01-31T23:59:59.999Z",
      };

      const filteredWorklogs = worklogMockFactory.createWorklogList(2);
      mockUseCase.execute = async () => ({ worklogs: filteredWorklogs });

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle validation errors", async () => {
      const params = {
        issueKey: "INVALID",
      };

      mockValidator.validateGetWorklogsParams = () => {
        throw new Error("Invalid issue key format");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue key format");
    });

    test("should handle use case errors", async () => {
      const params = {
        issueKey: "TEST-123",
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
      };

      mockUseCase.execute = async () => {
        throw new Error("Network error");
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle large worklog lists", async () => {
      const params = {
        issueKey: "TEST-123",
        maxResults: 1000,
      };

      const largeWorklogList = worklogMockFactory.createWorklogList(100);
      mockUseCase.execute = async () => ({ worklogs: largeWorklogList });

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should handle empty parameters", async () => {
      mockValidator.validateGetWorklogsParams = () => {
        throw new Error("Missing required parameters");
      };

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should handle null parameters", async () => {
      mockValidator.validateGetWorklogsParams = () => {
        throw new Error("Invalid parameters");
      };

      const result = await handler.handle(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
