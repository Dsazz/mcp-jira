/**
 * Update Issue Handler Test Helpers
 * Utilities for simplifying update issue handler tests by extracting complex mock setup
 */

import type { JiraClient } from "@features/jira/api/jira.client.impl";
import {
  JiraApiError,
  type JiraErrorResponse,
  JiraNetworkError,
} from "@features/jira/api/jira.errors";
import type { Issue } from "@features/jira/api/jira.models.types";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { mockHttp } from "@test/utils/mock-helpers";

// Test Constants - Centralized configuration
export const TEST_CONSTANTS = {
  ENDPOINTS: {
    ISSUE: (key: string) => `/rest/api/3/issue/${key}`,
    WORKLOG: (key: string) => `/rest/api/3/issue/${key}/worklog`,
  },
  TRANSITIONS: {
    START_PROGRESS: {
      id: "11",
      name: "Start Progress",
      statusId: "3",
      statusName: "In Progress",
      categoryId: 4,
      categoryName: "In Progress",
      colorName: "yellow",
    },
    DONE: {
      id: "31",
      name: "Done",
      statusId: "10001",
      statusName: "Done",
      categoryId: 3,
      categoryName: "Done",
      colorName: "green",
    },
  },
  USERS: {
    JOHN_DOE: {
      accountId: "john.doe",
      displayName: "John Doe",
      emailAddress: "john.doe@company.com",
    },
    UNKNOWN: {
      displayName: "Unknown User",
    },
  },
  WORKLOG: {
    DEFAULT_ID: "12345",
  },
  TEST_ISSUES: {
    WITH_START_PROGRESS: ["TEST-200", "TEST-500"] as readonly string[],
    WITH_START_PROGRESS_SINGLE: ["TEST-201"] as readonly string[],
    WITH_DONE_TRANSITION: ["TEST-202"] as readonly string[],
    // Test issue keys for different scenarios
    BASIC_UPDATES: {
      SUMMARY: "TEST-123",
      DESCRIPTION: "TEST-124",
      PRIORITY: "TEST-125",
      ASSIGNEE: "TEST-126",
      MULTIPLE_FIELDS: "TEST-127",
    },
    ARRAY_OPERATIONS: {
      ADD_LABELS: "TEST-300",
      REMOVE_LABELS: "TEST-301",
      SET_LABELS: "TEST-302",
      COMPONENTS: "TEST-303",
    },
    TIME_TRACKING: {
      UPDATE_TIME: "TEST-400",
      ADD_WORKLOG: "TEST-401",
      INVALID_WORKLOG: "TEST-402",
    },
    ERROR_SCENARIOS: {
      NOT_FOUND: "NONEXIST-1",
      PERMISSION_DENIED: "TEST-403",
      INVALID_PRIORITY: "TEST-404",
      EMPTY_UPDATE: "TEST-405",
      NETWORK_ERROR: "TEST-406",
      INVALID_KEY_FORMAT: "invalid-key-format",
      INVALID_ARRAY_OPS: "TEST-407",
      INVALID_TIME_FORMAT: "TEST-408",
      MISSING_WORKLOG_TIME: "TEST-409",
    },
    COMPLEX_SCENARIOS: {
      COMPREHENSIVE: "TEST-500",
      PARTIAL_SUCCESS: "TEST-501",
    },
  },
  MOCK_DATA: {
    LABELS: {
      EXISTING: ["testing", "mock-data"],
      NEW: ["new-label", "urgent"],
      COMPREHENSIVE: ["comprehensive", "test"],
      COMPLETE_SET: ["label1", "label2", "label3"],
    },
    COMPONENTS: {
      FRONTEND: { id: "10001", name: "Frontend" },
      API: { id: "10002", name: "API" },
    },
    PRIORITIES: {
      HIGH: "High",
      INVALID: "InvalidPriority",
    },
    TIME_ESTIMATES: {
      EIGHT_HOURS: "8h",
      SIX_HOURS: "6h",
      TWO_HOURS: "2h",
      FOUR_HOURS: "4h",
      EIGHT_HOURS_SECONDS: 28800, // 8h in seconds
      SIX_HOURS_SECONDS: 21600, // 6h in seconds
    },
    SUMMARIES: {
      UPDATED: "Updated summary text",
      MULTI_FIELD: "Multi-field update test",
      COMPREHENSIVE: "Comprehensive update test",
      PARTIAL_SUCCESS: "Partial success test",
      NETWORK_ERROR: "Network error test",
      UNAUTHORIZED: "Unauthorized update",
    },
    DESCRIPTIONS: {
      UPDATED: "Updated description",
      MULTI_FIELD: "Updated description for multi-field test",
      COMPREHENSIVE: "Updated description with all fields",
    },
    ERROR_MESSAGES: {
      NOT_FOUND: "Issue Does Not Exist: NONEXIST-1",
      PERMISSION_DENIED: "Insufficient permissions",
      INVALID_PRIORITY: "Priority 'InvalidPriority' does not exist",
      NO_FIELDS: "No fields to update",
      NETWORK_ERROR: "Network error",
      WORKLOG_ERROR: "Worklog error",
    },
  },
} as const;

// Type definitions for better type safety
interface TransitionConfig {
  readonly id: string;
  readonly name: string;
  readonly statusId: string;
  readonly statusName: string;
  readonly categoryId: number;
  readonly categoryName: string;
  readonly colorName: string;
}

interface MockUpdateData {
  readonly fields?: Record<string, unknown>;
  readonly update?: Record<string, unknown[]>;
  readonly transition?: { id: string };
}

interface MockWorklogEntry {
  readonly id: string;
  readonly timeSpent: string;
  readonly comment?: string;
  readonly started?: string;
}

/**
 * Creates a status object from transition configuration
 */
function createStatusFromTransition(transition: TransitionConfig) {
  return {
    name: transition.statusName,
    statusCategory: {
      name: transition.categoryName,
      colorName: transition.colorName,
    },
  };
}

/**
 * Handles field updates for mock issues
 */
function applyFieldUpdates(
  baseIssue: Issue,
  fields: Record<string, unknown>,
): void {
  if (fields.summary) {
    baseIssue.fields = {
      ...baseIssue.fields,
      summary: fields.summary as string,
    };
  }

  if (fields.description) {
    const description = fields.description as string | object;
    (baseIssue.fields as Record<string, unknown>).description =
      typeof description === "string"
        ? mockFactory.createADFParagraph(description)
        : description;
  }

  if (fields.priority) {
    const priority = fields.priority as { name: string };
    (baseIssue.fields as Record<string, unknown>).priority = {
      name: priority.name,
    };
  }

  if (fields.assignee) {
    const assignee = fields.assignee as { accountId: string };
    baseIssue.fields = {
      ...baseIssue.fields,
      assignee: {
        accountId: assignee.accountId,
        displayName:
          assignee.accountId === TEST_CONSTANTS.USERS.JOHN_DOE.accountId
            ? TEST_CONSTANTS.USERS.JOHN_DOE.displayName
            : TEST_CONSTANTS.USERS.UNKNOWN.displayName,
      },
    };
  }

  if (fields.timeoriginalestimate) {
    baseIssue.fields = {
      ...baseIssue.fields,
      timeoriginalestimate: fields.timeoriginalestimate as number,
    };
  }
}

/**
 * Handles array operations (labels, components) for mock issues
 */
function applyArrayUpdates(
  baseIssue: Issue,
  updates: Record<string, unknown[]>,
): void {
  if (updates.labels) {
    const labelOps = updates.labels;
    let currentLabels = (baseIssue.fields?.labels as string[]) || [];

    for (const op of labelOps) {
      const operation = op as {
        add?: string;
        remove?: string;
        set?: string[];
      };

      if (operation.add) {
        currentLabels = [...currentLabels, operation.add];
      }
      if (operation.remove) {
        currentLabels = currentLabels.filter(
          (label) => label !== operation.remove,
        );
      }
      if (operation.set) {
        currentLabels = operation.set;
      }
    }

    baseIssue.fields = {
      ...baseIssue.fields,
      labels: currentLabels,
    };
  }

  if (updates.components) {
    const componentOps = updates.components;
    let currentComponents =
      (baseIssue.fields?.components as Array<{ name: string }>) || [];

    for (const op of componentOps) {
      const operation = op as {
        add?: { name: string };
        remove?: { name: string };
        set?: { name: string }[];
      };

      if (operation.add) {
        currentComponents = [...currentComponents, operation.add];
      }
      if (operation.remove) {
        currentComponents = currentComponents.filter(
          (comp: { name: string }) => comp.name !== operation.remove?.name,
        );
      }
      if (operation.set) {
        currentComponents = operation.set;
      }
    }

    baseIssue.fields = {
      ...baseIssue.fields,
      components: currentComponents,
    };
  }
}

/**
 * Handles status transitions for mock issues
 */
function applyStatusTransition(baseIssue: Issue, transitionId: string): void {
  if (transitionId === TEST_CONSTANTS.TRANSITIONS.START_PROGRESS.id) {
    baseIssue.fields = {
      ...baseIssue.fields,
      status: createStatusFromTransition(
        TEST_CONSTANTS.TRANSITIONS.START_PROGRESS,
      ),
    };
  } else if (transitionId === TEST_CONSTANTS.TRANSITIONS.DONE.id) {
    baseIssue.fields = {
      ...baseIssue.fields,
      status: createStatusFromTransition(TEST_CONSTANTS.TRANSITIONS.DONE),
    };
  }
}

/**
 * Determines available transitions for a given issue key
 */
function getAvailableTransitions(issueKey: string) {
  if (
    TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS.includes(issueKey) ||
    TEST_CONSTANTS.TEST_ISSUES.WITH_START_PROGRESS_SINGLE.includes(issueKey)
  ) {
    const transition = TEST_CONSTANTS.TRANSITIONS.START_PROGRESS;
    return [
      {
        id: transition.id,
        name: transition.name,
        to: {
          id: transition.statusId,
          name: transition.statusName,
          statusCategory: {
            id: transition.categoryId,
            name: transition.categoryName,
            colorName: transition.colorName,
          },
        },
      },
    ];
  }

  if (TEST_CONSTANTS.TEST_ISSUES.WITH_DONE_TRANSITION.includes(issueKey)) {
    const transition = TEST_CONSTANTS.TRANSITIONS.DONE;
    return [
      {
        id: transition.id,
        name: transition.name,
        to: {
          id: transition.statusId,
          name: transition.statusName,
          statusCategory: {
            id: transition.categoryId,
            name: transition.categoryName,
            colorName: transition.colorName,
          },
        },
      },
    ];
  }

  return [];
}

/**
 * Checks for HTTP error mocks and throws appropriate errors
 */
async function checkForHttpErrors(endpoint: string): Promise<void> {
  const errorMock = mockHttp.getMock(endpoint);
  if (errorMock) {
    const mockResponse = await errorMock();
    if (!mockResponse.ok) {
      const errorData = (await mockResponse.json()) as {
        errorMessages?: string[];
      };
      throw new JiraApiError(
        errorData?.errorMessages?.[0] || `HTTP ${mockResponse.status}`,
        mockResponse.status,
        errorData as JiraErrorResponse,
      );
    }
  }
}

/**
 * Checks for network error mocks and throws appropriate errors
 */
function checkForNetworkErrors(endpoint: string): void {
  const networkErrorMock = mockHttp.getMock(endpoint);
  if (networkErrorMock?.toString().includes("Network error")) {
    throw new JiraNetworkError("Network error");
  }
}

/**
 * Creates a mock updateIssue function that simulates JIRA API behavior
 * Extracted from the original 150+ line inline implementation
 */
export function createMockUpdateIssue() {
  return async (
    issueKey: string,
    updateData: MockUpdateData,
  ): Promise<Issue> => {
    const endpoint = TEST_CONSTANTS.ENDPOINTS.ISSUE(issueKey);
    await checkForHttpErrors(endpoint);

    const baseIssue = mockFactory.createMockIssue({ key: issueKey });

    // Apply field updates
    if (updateData.fields) {
      applyFieldUpdates(baseIssue, updateData.fields);
    }

    // Apply array updates
    if (updateData.update) {
      applyArrayUpdates(baseIssue, updateData.update);
    }

    // Apply status transition
    if (updateData.transition) {
      applyStatusTransition(baseIssue, updateData.transition.id);
    }

    return baseIssue;
  };
}

/**
 * Creates a mock getIssueTransitions function
 * Extracted from the original 50+ line inline implementation
 */
export function createMockGetIssueTransitions() {
  return async (issueKey: string) => {
    return getAvailableTransitions(issueKey);
  };
}

/**
 * Creates a mock addWorklog function
 * Extracted from the original 30+ line inline implementation
 */
export function createMockAddWorklog() {
  return async (
    issueKey: string,
    timeSpent: string,
    comment?: string,
    started?: string,
  ): Promise<MockWorklogEntry> => {
    const endpoint = TEST_CONSTANTS.ENDPOINTS.WORKLOG(issueKey);
    await checkForHttpErrors(endpoint);
    checkForNetworkErrors(endpoint);

    return {
      id: TEST_CONSTANTS.WORKLOG.DEFAULT_ID,
      timeSpent,
      comment,
      started,
    };
  };
}

/**
 * Factory function to create a complete mock JIRA client for update issue tests
 * Replaces the original 200+ line beforeEach setup
 */
export function createMockUpdateClient(): Partial<JiraClient> {
  return {
    updateIssue: createMockUpdateIssue(),
    getIssueTransitions: createMockGetIssueTransitions(),
    addWorklog: createMockAddWorklog(),
  };
}
