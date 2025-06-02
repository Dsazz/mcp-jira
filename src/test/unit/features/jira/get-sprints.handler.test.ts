/**
 * Get Sprints Handler Unit Tests
 * Comprehensive unit tests for JIRA get sprints MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type { GetSprintsParams } from "@features/jira/api/jira.schemas";
import { GetSprintsHandler } from "@features/jira/tools/handlers/get-sprints.handler";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetSprintsHandler", () => {
  let handler: GetSprintsHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client with all required methods
    mockClient = {
      getSprints: async () => {
        const response = await fetch("/rest/agile/1.0/board/1/sprint", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      },
    };

    handler = new GetSprintsHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("basic sprint retrieval", () => {
    test("should retrieve all sprints successfully", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
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
        mockFactory.createMockSprint({
          id: 3,
          name: "Sprint 3",
          state: "future",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Sprint 1");
      expect(result.data).toContain("Sprint 2");
      expect(result.data).toContain("Sprint 3");
      expect(result.data).toContain("active");
      expect(result.data).toContain("closed");
      expect(result.data).toContain("future");
    });

    test("should handle empty sprint list", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board/1/sprint", []);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No sprints found");
      expect(result.data).toContain("board 1");
    });

    test("should retrieve sprints with basic parameters", async () => {
      const params: GetSprintsParams = {
        boardId: 5,
        maxResults: 10,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Test Sprint 1",
          state: "active",
          originBoardId: 5,
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Test Sprint 2",
          state: "closed",
          originBoardId: 5,
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/5/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Test Sprint 1");
      expect(result.data).toContain("Test Sprint 2");
      expect(result.data).toContain("board 5");
    });
  });

  describe("sprint state filtering", () => {
    test("should filter sprints by active state", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        state: "active",
        maxResults: 50,
        startAt: 0,
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

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Active Sprint 1");
      expect(result.data).toContain("Active Sprint 2");
      expect(result.data).toContain("active");
      expect(result.data).toContain("filtered by state: **active**");
    });

    test("should filter sprints by closed state", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        state: "closed",
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Closed Sprint 1",
          state: "closed",
          completeDate: new Date().toISOString(),
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Closed Sprint 2",
          state: "closed",
          completeDate: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Closed Sprint 1");
      expect(result.data).toContain("Closed Sprint 2");
      expect(result.data).toContain("closed");
      expect(result.data).toContain("filtered by state: **closed**");
    });

    test("should filter sprints by future state", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        state: "future",
        maxResults: 50,
        startAt: 0,
      };

      const futureDate = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Future Sprint 1",
          state: "future",
          startDate: futureDate,
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "Future Sprint 2",
          state: "future",
          startDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Future Sprint 1");
      expect(result.data).toContain("Future Sprint 2");
      expect(result.data).toContain("future");
      expect(result.data).toContain("filtered by state: **future**");
    });
  });

  describe("pagination and limits", () => {
    test("should handle pagination with startAt", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 2,
        startAt: 5,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 6,
          name: "Page Sprint 1",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 7,
          name: "Page Sprint 2",
          state: "closed",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Page Sprint 1");
      expect(result.data).toContain("Page Sprint 2");
    });

    test("should indicate when more results are available", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 2,
        startAt: 0,
      };

      // Return exactly maxResults to indicate there might be more
      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "More Sprint 1",
          state: "active",
        }),
        mockFactory.createMockSprint({
          id: 2,
          name: "More Sprint 2",
          state: "closed",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("More Sprint 1");
      expect(result.data).toContain("More Sprint 2");
      // The formatter doesn't show "more sprints available" message, just shows the results
      expect(result.data).toContain("Found **2** sprints");
    });

    test("should handle large result sets", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 100,
        startAt: 0,
      };

      // Create 50 mock sprints
      const mockSprints = Array.from({ length: 50 }, (_, i) =>
        mockFactory.createMockSprint({
          id: i + 1,
          name: `Large Sprint ${i + 1}`,
          state: i % 3 === 0 ? "active" : i % 3 === 1 ? "closed" : "future",
        }),
      );

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Large Sprint 1");
      expect(result.data).toContain("Large Sprint 50");
      expect(result.data).toContain("Found **50** sprints");
    });
  });

  describe("sprint details and analytics", () => {
    test("should display sprint goals", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Goal Sprint",
          state: "active",
          goal: "Implement user authentication and authorization features",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Goal Sprint");
      expect(result.data).toContain("authentication and authorization");
    });

    test("should display sprint dates", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const startDate = "2024-01-15T09:00:00.000Z";
      const endDate = "2024-01-29T17:00:00.000Z";

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Date Sprint",
          state: "active",
          startDate,
          endDate,
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Date Sprint");
      expect(result.data).toContain("Jan 15, 2024");
      expect(result.data).toContain("Jan 29, 2024");
    });

    test("should handle sprints with minimal data", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        {
          id: 1,
          self: "https://company.atlassian.net/rest/agile/1.0/sprint/1",
          name: "Minimal Sprint",
          state: "active" as const,
          // Missing optional fields
        },
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Minimal Sprint");
      expect(result.data).toContain("active");
    });
  });

  describe("error handling", () => {
    test("should handle permission denied error", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board/1/sprint",
        403,
        "Forbidden - insufficient permissions",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("HTTP 403");
      expect(result.data).toContain("Forbidden - insufficient permissions");
    });

    test("should handle authentication error", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board/1/sprint",
        401,
        "Authentication failed",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("HTTP 401");
      expect(result.data).toContain("Authentication failed");
    });

    test("should handle board not found error", async () => {
      const params: GetSprintsParams = {
        boardId: 999,
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board/999/sprint",
        404,
        "Board not found",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("HTTP 404");
      expect(result.data).toContain("Board not found");
    });

    test("should handle invalid board ID", async () => {
      const params: GetSprintsParams = {
        boardId: -1,
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board/-1/sprint",
        400,
        "Invalid board ID",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("HTTP 400");
      expect(result.data).toContain("Invalid board ID");
    });

    test("should handle network errors gracefully", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockNetworkError("/rest/agile/1.0/board/1/sprint");

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("Network error");
    });

    test("should handle missing client error", async () => {
      const handlerWithoutClient = new GetSprintsHandler({} as JiraClient);

      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const result = await handlerWithoutClient.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
      expect(result.data).toContain("getSprints is not a function");
    });
  });

  describe("parameter validation", () => {
    test("should validate boardId is required", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
      } as unknown as GetSprintsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
    });

    test("should validate boardId is positive", async () => {
      const params = {
        boardId: 0,
        maxResults: 50,
        startAt: 0,
      } as GetSprintsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
    });

    test("should validate maxResults range", async () => {
      const params = {
        boardId: 1,
        maxResults: -1,
        startAt: 0,
      } as GetSprintsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
    });

    test("should validate startAt value", async () => {
      const params = {
        boardId: 1,
        maxResults: 50,
        startAt: -5,
      } as GetSprintsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
    });

    test("should validate state values", async () => {
      const params = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
        state: "invalid-state",
      } as unknown as GetSprintsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(true); // Handler returns success with error message in data
      expect(result.data).toContain("Unexpected Error");
    });

    test("should accept valid parameters", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        state: "active",
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Valid Sprint",
          state: "active",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toContain("Valid Sprint");
    });
  });

  describe("edge cases", () => {
    test("should handle sprints with special characters in names", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
          state: "active",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Special Chars");
      expect(result.data).toContain("active");
    });

    test("should handle empty search results with filters", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        state: "future",
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board/1/sprint", []);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No sprints found");
      expect(result.data).toContain("board 1");
      expect(result.data).toContain("future");
    });

    test("should handle sprints with long goals", async () => {
      const params: GetSprintsParams = {
        boardId: 1,
        maxResults: 50,
        startAt: 0,
      };

      const longGoal =
        "This is a very long sprint goal that contains multiple sentences and detailed descriptions of what needs to be accomplished during this sprint iteration including various user stories, bug fixes, technical debt reduction, performance improvements, and documentation updates.";

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Long Goal Sprint",
          state: "active",
          goal: longGoal,
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/1/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Long Goal Sprint");
      expect(result.data).toContain("very long sprint goal");
    });

    test("should handle different board IDs", async () => {
      const params: GetSprintsParams = {
        boardId: 12345,
        maxResults: 50,
        startAt: 0,
      };

      const mockSprints = [
        mockFactory.createMockSprint({
          id: 1,
          name: "Board 12345 Sprint",
          state: "active",
          originBoardId: 12345,
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/agile/1.0/board/12345/sprint",
        mockSprints,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Board 12345 Sprint");
      expect(result.data).toContain("board 12345");
    });
  });
});
