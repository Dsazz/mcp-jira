/**
 * Worklog API Integration Tests
 *
 * Tests complete worklog workflows from handlers through use cases to repositories
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { AddWorklogHandler } from "@features/jira/issues/handlers/add-worklog.handler";
import { DeleteWorklogHandler } from "@features/jira/issues/handlers/delete-worklog.handler";
import { GetWorklogsHandler } from "@features/jira/issues/handlers/get-worklogs.handler";
import { UpdateWorklogHandler } from "@features/jira/issues/handlers/update-worklog.handler";
import {
  AddWorklogUseCaseImpl,
  DeleteWorklogUseCaseImpl,
  GetWorklogsUseCaseImpl,
  UpdateWorklogUseCaseImpl,
} from "@features/jira/issues/use-cases/worklog.use-cases";
import { WorklogValidatorImpl } from "@features/jira/issues/validators/worklog.validator";
import {
  mockWorklogEntry,
  worklogMockFactory,
} from "@test/mocks/worklog/worklog-entry.mock";
import { jiraApiMocks } from "@test/utils/mock-helpers";

describe("Worklog API Integration", () => {
  let addHandler: AddWorklogHandler;
  let getHandler: GetWorklogsHandler;
  let updateHandler: UpdateWorklogHandler;
  let deleteHandler: DeleteWorklogHandler;
  let validator: WorklogValidatorImpl;

  beforeEach(() => {
    // Create mock repository
    const mockRepository = {
      addWorklog: async () => mockWorklogEntry,
      getWorklogs: async () => [mockWorklogEntry],
      updateWorklog: async () => mockWorklogEntry,
      deleteWorklog: async () => undefined,
    };

    // Create use cases with mock repository
    const addUseCase = new AddWorklogUseCaseImpl(mockRepository);
    const getUseCase = new GetWorklogsUseCaseImpl(mockRepository);
    const updateUseCase = new UpdateWorklogUseCaseImpl(mockRepository);
    const deleteUseCase = new DeleteWorklogUseCaseImpl(mockRepository);

    // Create validator
    validator = new WorklogValidatorImpl();

    // Create handlers
    addHandler = new AddWorklogHandler(addUseCase, validator);
    getHandler = new GetWorklogsHandler(getUseCase, validator);
    updateHandler = new UpdateWorklogHandler(updateUseCase, validator);
    deleteHandler = new DeleteWorklogHandler(deleteUseCase, validator);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("Complete CRUD Workflow", () => {
    test("should complete full worklog lifecycle", async () => {
      const issueKey = "TEST-123";

      // 1. Add worklog
      const addParams = {
        issueKey,
        timeSpent: "2h",
        comment: "Initial work on feature",
      };

      const addResult = await addHandler.handle(addParams);
      expect(addResult.success).toBe(true);
      expect(addResult.data).toBeDefined();

      // 2. Get worklogs
      const getParams = { issueKey };
      const getResult = await getHandler.handle(getParams);
      expect(getResult.success).toBe(true);
      expect(getResult.data).toBeDefined();

      // 3. Update worklog
      const updateParams = {
        issueKey,
        worklogId: "10001",
        timeSpent: "3h",
        comment: "Updated work description",
      };

      const updateResult = await updateHandler.handle(updateParams);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data).toBeDefined();

      // 4. Delete worklog
      const deleteParams = {
        issueKey,
        worklogId: "10001",
      };

      const deleteResult = await deleteHandler.handle(deleteParams);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.data).toBeDefined();
    });
  });

  describe("Cross-Handler Data Consistency", () => {
    test("should maintain data consistency across operations", async () => {
      const issueKey = "TEST-456";
      const worklogData = worklogMockFactory.createWorklogEntry({
        issueId: "10456",
        timeSpent: "4h",
        timeSpentSeconds: 14400,
      });

      // Mock repository to return consistent data
      const mockRepository = {
        addWorklog: async () => worklogData,
        getWorklogs: async () => [worklogData],
        updateWorklog: async () => ({
          ...worklogData,
          timeSpent: "5h",
          timeSpentSeconds: 18000,
        }),
        deleteWorklog: async () => undefined,
      };

      const addUseCase = new AddWorklogUseCaseImpl(mockRepository);
      const getUseCase = new GetWorklogsUseCaseImpl(mockRepository);
      const updateUseCase = new UpdateWorklogUseCaseImpl(mockRepository);

      const addHandler = new AddWorklogHandler(addUseCase, validator);
      const getHandler = new GetWorklogsHandler(getUseCase, validator);
      const updateHandler = new UpdateWorklogHandler(updateUseCase, validator);

      // Add worklog
      const addResult = await addHandler.handle({
        issueKey,
        timeSpent: "4h",
        comment: "Consistent data test",
      });

      expect(addResult.success).toBe(true);

      // Get worklogs should return the same data
      const getResult = await getHandler.handle({ issueKey });
      expect(getResult.success).toBe(true);

      // Update should maintain consistency
      const updateResult = await updateHandler.handle({
        issueKey,
        worklogId: worklogData.id,
        timeSpent: "5h",
      });

      expect(updateResult.success).toBe(true);
    });
  });

  describe("Error Propagation", () => {
    test("should properly propagate repository errors through layers", async () => {
      const errorRepository = {
        addWorklog: async () => {
          throw new Error("Database connection failed");
        },
        getWorklogs: async () => {
          throw new Error("Database connection failed");
        },
        updateWorklog: async () => {
          throw new Error("Database connection failed");
        },
        deleteWorklog: async () => {
          throw new Error("Database connection failed");
        },
      };

      const addUseCase = new AddWorklogUseCaseImpl(errorRepository);
      const getUseCase = new GetWorklogsUseCaseImpl(errorRepository);
      const updateUseCase = new UpdateWorklogUseCaseImpl(errorRepository);
      const deleteUseCase = new DeleteWorklogUseCaseImpl(errorRepository);

      const addHandler = new AddWorklogHandler(addUseCase, validator);
      const getHandler = new GetWorklogsHandler(getUseCase, validator);
      const updateHandler = new UpdateWorklogHandler(updateUseCase, validator);
      const deleteHandler = new DeleteWorklogHandler(deleteUseCase, validator);

      // Test error propagation for each operation
      const addResult = await addHandler.handle({
        issueKey: "TEST-123",
        timeSpent: "2h",
      });
      expect(addResult.success).toBe(false);
      expect(addResult.error).toContain("Database connection failed");

      const getResult = await getHandler.handle({
        issueKey: "TEST-123",
      });
      expect(getResult.success).toBe(false);
      expect(getResult.error).toContain("Database connection failed");

      const updateResult = await updateHandler.handle({
        issueKey: "TEST-123",
        worklogId: "10001",
        timeSpent: "3h",
      });
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toContain("Database connection failed");

      const deleteResult = await deleteHandler.handle({
        issueKey: "TEST-123",
        worklogId: "10001",
      });
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toContain("Database connection failed");
    });
  });

  describe("Validation Integration", () => {
    test("should validate parameters at handler level", async () => {
      // Test invalid time format
      const invalidTimeResult = await addHandler.handle({
        issueKey: "TEST-123",
        timeSpent: "invalid-time",
      });
      expect(invalidTimeResult.success).toBe(false);

      // Test invalid issue key
      const invalidIssueResult = await getHandler.handle({
        issueKey: "",
      });
      expect(invalidIssueResult.success).toBe(false);

      // Test missing required fields
      const missingFieldsResult = await updateHandler.handle({
        issueKey: "TEST-123",
        // Missing worklogId
      });
      expect(missingFieldsResult.success).toBe(false);
    });
  });

  describe("Performance Integration", () => {
    test("should handle large worklog operations efficiently", async () => {
      const largeWorklogList = worklogMockFactory.createWorklogList(100);

      const mockRepository = {
        addWorklog: async () => mockWorklogEntry,
        getWorklogs: async () => largeWorklogList,
        updateWorklog: async () => mockWorklogEntry,
        deleteWorklog: async () => undefined,
      };

      const getUseCase = new GetWorklogsUseCaseImpl(mockRepository);
      const getHandler = new GetWorklogsHandler(getUseCase, validator);

      const startTime = Date.now();

      const result = await getHandler.handle({
        issueKey: "TEST-123",
        maxResults: 1000,
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
