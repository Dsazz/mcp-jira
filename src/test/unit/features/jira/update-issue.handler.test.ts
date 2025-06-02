/**
 * Update Issue Handler Unit Tests
 * Comprehensive unit tests for JIRA update issue MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type { UpdateIssueParams } from "@features/jira/api/jira.schemas";
import { UpdateIssueHandler } from "@features/jira/tools/handlers/update-issue.handler";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";
import {
  TEST_CONSTANTS,
  createMockUpdateClient,
} from "./update-issue-test.helpers";

// Setup test environment
setupTests();

describe("UpdateIssueHandler", () => {
  let handler: UpdateIssueHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client using extracted utilities
    mockClient = createMockUpdateClient();
    handler = new UpdateIssueHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("basic field updates", () => {
    test("should update summary field successfully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.SUMMARY,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.UPDATED,
        notifyUsers: true,
      };

      // Create mock issue with updated summary
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.SUMMARY,
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.UPDATED,
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.SUMMARY,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.SUMMARY,
      );
      expect(result.data).toContain(TEST_CONSTANTS.MOCK_DATA.SUMMARIES.UPDATED);
    });

    test("should update description field successfully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.DESCRIPTION,
        description: TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.UPDATED,
        notifyUsers: true,
      };

      // Create mock issue with updated description
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.DESCRIPTION,
        fields: {
          ...mockFactory.createMockIssue().fields,
          description: mockFactory.createADFParagraph(
            TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.UPDATED,
          ),
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.DESCRIPTION,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.DESCRIPTION,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.UPDATED,
      );
    });

    test("should update priority field successfully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.PRIORITY,
        priority: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH,
        notifyUsers: true,
      };

      // Create mock issue with updated priority
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.PRIORITY,
        fields: {
          ...mockFactory.createMockIssue().fields,
          priority: { name: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH },
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.PRIORITY,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.PRIORITY,
      );
      expect(result.data).toContain(TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH);
    });

    test("should update assignee field successfully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.ASSIGNEE,
        assignee: TEST_CONSTANTS.USERS.JOHN_DOE.accountId,
        notifyUsers: true,
      };

      // Create mock issue with updated assignee
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.ASSIGNEE,
        fields: {
          ...mockFactory.createMockIssue().fields,
          assignee: mockFactory.createMockUser({
            displayName: TEST_CONSTANTS.USERS.JOHN_DOE.displayName,
            emailAddress: TEST_CONSTANTS.USERS.JOHN_DOE.emailAddress,
          }),
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.ASSIGNEE,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.ASSIGNEE,
      );
      expect(result.data).toContain(TEST_CONSTANTS.USERS.JOHN_DOE.displayName);
    });

    test("should update multiple fields simultaneously", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.MULTIPLE_FIELDS,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.MULTI_FIELD,
        description: TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.MULTI_FIELD,
        priority: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH,
        assignee: TEST_CONSTANTS.USERS.JOHN_DOE.accountId,
        notifyUsers: true,
      };

      // Create mock issue with all updated fields
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.MULTIPLE_FIELDS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.MULTI_FIELD,
          description: mockFactory.createADFParagraph(
            TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.MULTI_FIELD,
          ),
          priority: { name: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH },
          assignee: mockFactory.createMockUser({
            displayName: TEST_CONSTANTS.USERS.JOHN_DOE.displayName,
            emailAddress: TEST_CONSTANTS.USERS.JOHN_DOE.emailAddress,
          }),
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.MULTIPLE_FIELDS,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.BASIC_UPDATES.MULTIPLE_FIELDS,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.SUMMARIES.MULTI_FIELD,
      );
    });
  });

  describe("status transitions", () => {
    test("should transition issue status successfully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS[0], // "TEST-200"
        status: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
        notifyUsers: true,
      };

      // Mock transitions FIRST - return object with transitions property to match real API
      const mockTransitions = {
        transitions: [
          {
            id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.id,
            name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.name,
            to: {
              id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusId,
              name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
              statusCategory: {
                id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryId,
                name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryName,
                colorName: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.colorName,
              },
            },
          },
        ],
      };

      jiraApiMocks.mockJiraApiSuccess(
        `${TEST_CONSTANTS.ENDPOINTS.ISSUE(TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS[0])}/transitions`,
        mockTransitions,
      );

      // Create mock issue with updated status AFTER transitions mock
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS[0],
        fields: {
          ...mockFactory.createMockIssue().fields,
          status: {
            name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
            statusCategory: {
              name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryName,
              colorName: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.colorName,
            },
          },
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS[0],
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS[0],
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
      );
    });

    test("should handle invalid status transition", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS_SINGLE[0], // "TEST-201"
        status: "Invalid Status",
        notifyUsers: true,
      };

      // Mock transitions - return object with transitions property to match real API
      const mockTransitions = {
        transitions: [
          {
            id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.id,
            name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.name,
            to: {
              id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusId,
              name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
              statusCategory: {
                id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryId,
                name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryName,
                colorName: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.colorName,
              },
            },
          },
        ],
      };

      jiraApiMocks.mockJiraApiSuccess(
        `${TEST_CONSTANTS.ENDPOINTS.ISSUE(TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS_SINGLE[0])}/transitions`,
        mockTransitions,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        "Status 'Invalid Status' is not available",
      );
    });

    test("should combine status transition with field updates", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION[0], // "TEST-202"
        summary: "Updated with status change",
        status: TEST_CONSTANTS.TRANSITIONS.DONE.statusName,
        notifyUsers: true,
      };

      // Mock transitions - return object with transitions property to match real API
      const mockTransitions = {
        transitions: [
          {
            id: TEST_CONSTANTS.TRANSITIONS.DONE.id,
            name: TEST_CONSTANTS.TRANSITIONS.DONE.name,
            to: {
              id: TEST_CONSTANTS.TRANSITIONS.DONE.statusId,
              name: TEST_CONSTANTS.TRANSITIONS.DONE.statusName,
            },
          },
        ],
      };

      jiraApiMocks.mockJiraApiSuccess(
        `${TEST_CONSTANTS.ENDPOINTS.ISSUE(TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION[0])}/transitions`,
        mockTransitions,
      );

      // Create mock issue with updated summary and status
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION[0],
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: "Updated with status change",
          status: {
            name: TEST_CONSTANTS.TRANSITIONS.DONE.statusName,
            statusCategory: {
              name: TEST_CONSTANTS.TRANSITIONS.DONE.categoryName,
              colorName: TEST_CONSTANTS.TRANSITIONS.DONE.colorName,
            },
          },
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION[0],
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION[0],
      );
      expect(result.data).toContain("Updated with status change");
      expect(result.data).toContain(TEST_CONSTANTS.TRANSITIONS.DONE.statusName);
    });
  });

  describe("array field operations", () => {
    test("should add labels to issue", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.ADD_LABELS,
        labels: {
          operation: "add",
          values: [...TEST_CONSTANTS.MOCK_DATA.LABELS.NEW],
        },
        notifyUsers: true,
      };

      // Create mock issue with updated labels
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.ADD_LABELS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          labels: [
            ...TEST_CONSTANTS.MOCK_DATA.LABELS.EXISTING,
            ...TEST_CONSTANTS.MOCK_DATA.LABELS.NEW,
          ],
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.ADD_LABELS,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.ADD_LABELS,
      );
      expect(result.data).toContain(TEST_CONSTANTS.MOCK_DATA.LABELS.NEW[0]);
    });

    test("should remove labels from issue", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.REMOVE_LABELS,
        labels: {
          operation: "remove",
          values: [TEST_CONSTANTS.MOCK_DATA.LABELS.EXISTING[0]], // "testing"
        },
        notifyUsers: true,
      };

      // Create mock issue with labels removed
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.REMOVE_LABELS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          labels: [TEST_CONSTANTS.MOCK_DATA.LABELS.EXISTING[1]], // "mock-data" only
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.REMOVE_LABELS,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.REMOVE_LABELS,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.LABELS.EXISTING[1],
      );
    });

    test("should set labels completely", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.SET_LABELS,
        labels: {
          operation: "set",
          values: [...TEST_CONSTANTS.MOCK_DATA.LABELS.COMPLETE_SET],
        },
        notifyUsers: true,
      };

      // Create mock issue with completely new labels
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.SET_LABELS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          labels: [...TEST_CONSTANTS.MOCK_DATA.LABELS.COMPLETE_SET],
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.SET_LABELS,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.SET_LABELS,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.LABELS.COMPLETE_SET[0],
      );
    });

    test("should handle components array operations", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.COMPONENTS,
        components: {
          operation: "add",
          values: [
            TEST_CONSTANTS.MOCK_DATA.COMPONENTS.FRONTEND.name,
            TEST_CONSTANTS.MOCK_DATA.COMPONENTS.API.name,
          ],
        },
        notifyUsers: true,
      };

      // Create mock issue with updated components
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.COMPONENTS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          components: [
            TEST_CONSTANTS.MOCK_DATA.COMPONENTS.FRONTEND,
            TEST_CONSTANTS.MOCK_DATA.COMPONENTS.API,
          ],
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.COMPONENTS,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.ARRAY_OPERATIONS.COMPONENTS,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.COMPONENTS.FRONTEND.name,
      );
    });
  });

  describe("time tracking and worklog", () => {
    test("should update time tracking fields", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.UPDATE_TIME,
        timeEstimate: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.EIGHT_HOURS,
        remainingEstimate: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.SIX_HOURS,
        notifyUsers: true,
      };

      // Create mock issue with updated time tracking
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.UPDATE_TIME,
        fields: {
          ...mockFactory.createMockIssue().fields,
          timeoriginalestimate:
            TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.EIGHT_HOURS_SECONDS,
          timeestimate:
            TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.SIX_HOURS_SECONDS,
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.UPDATE_TIME,
        ),
        updatedIssue,
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.UPDATE_TIME,
      );
      expect(result.data).toContain("timeoriginalestimate");
    });

    test("should add worklog entry", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.ADD_WORKLOG,
        worklog: {
          timeSpent: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.TWO_HOURS,
          comment: "Fixed the bug",
          started: "2024-01-15T09:00:00.000Z",
        },
        notifyUsers: true,
      };

      // Create mock issue (worklog doesn't change issue fields directly)
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.ADD_WORKLOG,
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.ADD_WORKLOG,
        ),
        updatedIssue,
      );
      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.WORKLOG(
          TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.ADD_WORKLOG,
        ),
        {},
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.ADD_WORKLOG,
      );
      expect(result.data).toContain("Worklog Entry");
    });

    test("should handle worklog failure gracefully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.TIME_TRACKING.INVALID_WORKLOG,
        worklog: {
          timeSpent: "invalid-time", // This will fail validation
        },
        notifyUsers: true,
      };

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Time spent must be in JIRA format");
    });
  });

  describe("error handling", () => {
    test("should handle issue not found error", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.NOT_FOUND,
        summary: "This should fail",
        notifyUsers: true,
      };

      mockHttp.mockJiraApiError(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.NOT_FOUND,
        ),
        404,
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.NOT_FOUND,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.NOT_FOUND,
      );
    });

    test("should handle permission denied error", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.PERMISSION_DENIED,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.UNAUTHORIZED,
        notifyUsers: true,
      };

      mockHttp.mockJiraApiError(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.PERMISSION_DENIED,
        ),
        403,
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.PERMISSION_DENIED,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("permission");
    });

    test("should handle invalid field values", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.INVALID_PRIORITY,
        priority: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.INVALID as "High", // Type assertion for test
        notifyUsers: true,
      };

      mockHttp.mockJiraApiError(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.INVALID_PRIORITY,
        ),
        400,
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.INVALID_PRIORITY,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        TEST_CONSTANTS.MOCK_DATA.PRIORITIES.INVALID,
      );
    });

    test("should handle validation errors for required fields", async () => {
      const updateParams = {
        // Missing issueKey
        summary: "This should fail validation",
        notifyUsers: true,
      } as UpdateIssueParams;

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
      expect(result.error).toContain("issueKey");
    });

    test("should handle empty update parameters", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.EMPTY_UPDATE,
        notifyUsers: true,
        // No fields to update - this should pass validation but fail at API level
      };

      // Mock API error for empty update
      mockHttp.mockJiraApiError(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.EMPTY_UPDATE,
        ),
        400,
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.NO_FIELDS,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.NO_FIELDS,
      );
    });

    test("should handle network errors gracefully", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.NETWORK_ERROR,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.NETWORK_ERROR,
        notifyUsers: true,
      };

      mockHttp.mockNetworkError(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.NETWORK_ERROR,
        ),
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.NETWORK_ERROR,
      );
    });
  });

  describe("parameter validation", () => {
    test("should validate issue key format", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.INVALID_KEY_FORMAT,
        summary: "Test summary",
        notifyUsers: true,
      };

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });

    test("should validate array operations structure", async () => {
      const updateParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.INVALID_ARRAY_OPS,
        labels: {
          invalidOperation: [TEST_CONSTANTS.MOCK_DATA.LABELS.COMPLETE_SET[0]],
        },
        notifyUsers: true,
      } as unknown as UpdateIssueParams;

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });

    test("should validate time tracking format", async () => {
      const updateParams = {
        issueKey:
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.INVALID_TIME_FORMAT,
        timeEstimate: "invalid-format",
        notifyUsers: true,
      } as UpdateIssueParams;

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });

    test("should validate worklog structure", async () => {
      const updateParams = {
        issueKey:
          TEST_CONSTANTS.TEST_ISSUES.ERROR_SCENARIOS.MISSING_WORKLOG_TIME,
        worklog: {
          // Missing required timeSpent field
          comment: "Missing time spent",
        },
        notifyUsers: true,
      } as UpdateIssueParams;

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid issue update parameters");
    });
  });

  describe("complex scenarios", () => {
    test("should handle comprehensive update with all field types", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.COMPREHENSIVE,
        description: TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.COMPREHENSIVE,
        priority: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH,
        assignee: TEST_CONSTANTS.USERS.JOHN_DOE.accountId,
        status: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
        labels: {
          operation: "add",
          values: [...TEST_CONSTANTS.MOCK_DATA.LABELS.COMPREHENSIVE],
        },
        timeEstimate: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.EIGHT_HOURS,
        worklog: {
          timeSpent: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.FOUR_HOURS,
        },
        notifyUsers: true,
      };

      // Mock transitions - return object with transitions property to match real API
      const mockTransitions = {
        transitions: [
          {
            id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.id,
            name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.name,
            to: {
              id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusId,
              name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
              statusCategory: {
                id: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryId,
                name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryName,
                colorName: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.colorName,
              },
            },
          },
        ],
      };

      jiraApiMocks.mockJiraApiSuccess(
        `${TEST_CONSTANTS.ENDPOINTS.ISSUE(TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE)}/transitions`,
        mockTransitions,
      );

      // Create comprehensive mock issue with all updates
      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE,
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.COMPREHENSIVE,
          description: mockFactory.createADFParagraph(
            TEST_CONSTANTS.MOCK_DATA.DESCRIPTIONS.COMPREHENSIVE,
          ),
          priority: { name: TEST_CONSTANTS.MOCK_DATA.PRIORITIES.HIGH },
          assignee: mockFactory.createMockUser({
            displayName: TEST_CONSTANTS.USERS.JOHN_DOE.displayName,
            emailAddress: TEST_CONSTANTS.USERS.JOHN_DOE.emailAddress,
          }),
          status: {
            name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.statusName,
            statusCategory: {
              name: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.categoryName,
              colorName: TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.colorName,
            },
          },
          labels: [
            ...TEST_CONSTANTS.MOCK_DATA.LABELS.EXISTING,
            ...TEST_CONSTANTS.MOCK_DATA.LABELS.COMPREHENSIVE,
          ],
          timeoriginalestimate:
            TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.EIGHT_HOURS_SECONDS,
        },
      });

      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE,
        ),
        updatedIssue,
      );
      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.WORKLOG(
          TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE,
        ),
        {},
      );

      const result = (await handler.handle(
        updateParams,
      )) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain(
        TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.COMPREHENSIVE,
      );
      expect(result.data).toContain(
        TEST_CONSTANTS.MOCK_DATA.SUMMARIES.COMPREHENSIVE,
      );
    });

    test("should handle partial success scenarios", async () => {
      const updateParams: UpdateIssueParams = {
        issueKey: TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.PARTIAL_SUCCESS,
        summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.PARTIAL_SUCCESS,
        worklog: {
          timeSpent: TEST_CONSTANTS.MOCK_DATA.TIME_ESTIMATES.TWO_HOURS,
          comment: "This worklog will fail",
        },
        notifyUsers: true,
      };

      const updatedIssue = mockFactory.createMockIssue({
        key: TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.PARTIAL_SUCCESS,
        fields: {
          ...mockFactory.createMockIssue().fields,
          summary: TEST_CONSTANTS.MOCK_DATA.SUMMARIES.PARTIAL_SUCCESS,
        },
      });

      // Mock successful issue update
      jiraApiMocks.mockJiraApiSuccess(
        TEST_CONSTANTS.ENDPOINTS.ISSUE(
          TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.PARTIAL_SUCCESS,
        ),
        updatedIssue,
      );

      // Mock worklog failure after successful issue update
      mockHttp.mockJiraApiError(
        TEST_CONSTANTS.ENDPOINTS.WORKLOG(
          TEST_CONSTANTS.TEST_ISSUES.COMPLEX_SCENARIOS.PARTIAL_SUCCESS,
        ),
        400,
        TEST_CONSTANTS.MOCK_DATA.ERROR_MESSAGES.WORKLOG_ERROR,
      );

      const result = await handler.handle(updateParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Partial Update Success");
      expect(result.error).toContain(
        "Issue updated successfully, but failed to add worklog",
      );
    });
  });
});
