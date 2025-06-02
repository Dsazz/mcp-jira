/**
 * Get Boards Handler Unit Tests
 * Comprehensive unit tests for JIRA get boards MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type {
  Board,
  GetBoardsOptions,
} from "@features/jira/api/jira.client.types";
import {
  JiraApiError,
  type JiraErrorResponse,
  JiraNetworkError,
} from "@features/jira/api/jira.errors";
import type { GetBoardsParams } from "@features/jira/api/jira.schemas";
import { GetBoardsHandler } from "@features/jira/tools/handlers/get-boards.handler";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetBoardsHandler", () => {
  let handler: GetBoardsHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client with all required methods
    mockClient = {
      getBoards: async (options?: GetBoardsOptions): Promise<Board[]> => {
        // Check for HTTP error mocks first
        const boardsEndpoint = "/rest/agile/1.0/board";
        const errorMock = mockHttp.getMock(boardsEndpoint);
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
          // Return successful mock response
          const responseData = (await mockResponse.json()) as {
            values: Board[];
          };
          return responseData.values;
        }

        // Check for network error mocks
        if (
          mockHttp.getMock(boardsEndpoint)?.toString().includes("Network error")
        ) {
          throw new JiraNetworkError("Network error");
        }

        // Use options parameter to avoid linter warning
        console.log("Mock client options:", options);

        // Default fallback - return empty boards list
        return [];
      },
    };

    handler = new GetBoardsHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("basic board retrieval", () => {
    test("should retrieve all boards successfully", async () => {
      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Scrum Board 1",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "Kanban Board 1",
            type: "kanban",
          }),
          mockFactory.createMockBoard({
            id: 3,
            name: "Simple Board 1",
            type: "simple",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Scrum Board 1");
      expect(result.data).toContain("Kanban Board 1");
      expect(result.data).toContain("Simple Board 1");
      expect(result.data).toContain("scrum");
      expect(result.data).toContain("kanban");
      expect(result.data).toContain("simple");
    });

    test("should handle empty board list", async () => {
      const mockBoards = { values: [] };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No boards found");
    });

    test("should retrieve boards with basic parameters", async () => {
      const params: GetBoardsParams = {
        maxResults: 5,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Test Board 1",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "Test Board 2",
            type: "kanban",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Test Board 1");
      expect(result.data).toContain("Test Board 2");
    });
  });

  describe("filtering and search", () => {
    test("should filter boards by type", async () => {
      const params: GetBoardsParams = {
        type: "scrum",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Scrum Board 1",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "Scrum Board 2",
            type: "scrum",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Scrum Board 1");
      expect(result.data).toContain("Scrum Board 2");
      expect(result.data).toContain("scrum");
    });

    test("should filter boards by name", async () => {
      const params: GetBoardsParams = {
        name: "Development",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Development Board",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "Development Kanban",
            type: "kanban",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Development Board");
      expect(result.data).toContain("Development Kanban");
    });

    test("should filter boards by project", async () => {
      const params: GetBoardsParams = {
        projectKeyOrId: "PROJ1",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Project Board",
            type: "scrum",
            location: { projectKey: "PROJ1" },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Project Board");
      expect(result.data).toContain("PROJ1");
    });

    test("should combine multiple filters", async () => {
      const params: GetBoardsParams = {
        type: "kanban",
        name: "API",
        projectKeyOrId: "API",
        maxResults: 10,
        startAt: 0,
        orderBy: "name",
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "API Kanban Board",
            type: "kanban",
            location: { projectKey: "API" },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("API Kanban Board");
      expect(result.data).toContain("kanban");
    });
  });

  describe("ordering and pagination", () => {
    test("should order boards by name", async () => {
      const params: GetBoardsParams = {
        orderBy: "name",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Alpha Board",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "Beta Board",
            type: "kanban",
          }),
          mockFactory.createMockBoard({
            id: 3,
            name: "Gamma Board",
            type: "simple",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Alpha Board");
      expect(result.data).toContain("Beta Board");
      expect(result.data).toContain("Gamma Board");
    });

    test("should handle pagination with startAt", async () => {
      const params: GetBoardsParams = {
        maxResults: 2,
        startAt: 5,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 6,
            name: "Page Board 1",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 7,
            name: "Page Board 2",
            type: "kanban",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Page Board 1");
      expect(result.data).toContain("Page Board 2");
    });

    test("should indicate when more results are available", async () => {
      const params: GetBoardsParams = {
        maxResults: 2,
        startAt: 0,
      };

      // Return exactly maxResults to indicate there might be more
      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "More Board 1",
            type: "scrum",
          }),
          mockFactory.createMockBoard({
            id: 2,
            name: "More Board 2",
            type: "kanban",
          }),
        ],
        isLast: false,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("More Board 1");
      expect(result.data).toContain("More Board 2");
      expect(result.data).toContain("more boards available");
    });
  });

  describe("board types", () => {
    test("should handle scrum boards", async () => {
      const params: GetBoardsParams = {
        type: "scrum",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Sprint Board",
            type: "scrum",
            location: { projectKey: "SCRUM" },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Sprint Board");
      expect(result.data).toContain("scrum");
    });

    test("should handle kanban boards", async () => {
      const params: GetBoardsParams = {
        type: "kanban",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Flow Board",
            type: "kanban",
            location: { projectKey: "KANBAN" },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Flow Board");
      expect(result.data).toContain("kanban");
    });

    test("should handle simple boards", async () => {
      const params: GetBoardsParams = {
        type: "simple",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Basic Board",
            type: "simple",
            location: { projectKey: "SIMPLE" },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Basic Board");
      expect(result.data).toContain("simple");
    });
  });

  describe("error handling", () => {
    test("should handle permission denied error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board",
        403,
        "Forbidden - insufficient permissions",
      );

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Forbidden - insufficient permissions");
    });

    test("should handle authentication error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board",
        401,
        "Authentication failed",
      );

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication failed");
    });

    test("should handle invalid board type", async () => {
      const params: GetBoardsParams = {
        type: "invalid-type" as "scrum",
        maxResults: 50,
        startAt: 0,
      };

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid board retrieval parameters");
      expect(result.error).toContain("type must be");
    });

    test("should handle invalid project key", async () => {
      const params: GetBoardsParams = {
        projectKeyOrId: "INVALID-PROJECT",
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/agile/1.0/board",
        400,
        "Invalid project key",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid project key");
    });

    test("should handle network errors gracefully", async () => {
      mockHttp.mockNetworkError("/rest/agile/1.0/board");

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    test("should handle missing client error", async () => {
      const handlerWithoutClient = new GetBoardsHandler({} as JiraClient);

      const result = await handlerWithoutClient.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA client not initialized");
    });
  });

  describe("parameter validation", () => {
    test("should validate maxResults range", async () => {
      const params = {
        maxResults: -1,
        startAt: 0,
      } as GetBoardsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid board retrieval parameters");
    });

    test("should validate startAt value", async () => {
      const params = {
        maxResults: 50,
        startAt: -5,
      } as GetBoardsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid board retrieval parameters");
    });

    test("should validate board type values", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
        type: "invalid-type",
      } as unknown as GetBoardsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid board retrieval parameters");
    });

    test("should validate orderBy values", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
        orderBy: "invalid-order",
      } as unknown as GetBoardsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid board retrieval parameters");
    });

    test("should accept valid parameters", async () => {
      const params: GetBoardsParams = {
        type: "scrum",
        name: "test",
        projectKeyOrId: "PROJ1",
        orderBy: "name",
        maxResults: 50,
        startAt: 0,
        includePrivate: true,
      };

      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Valid Board",
            type: "scrum",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toContain("Valid Board");
    });
  });

  describe("edge cases", () => {
    test("should handle very large result sets", async () => {
      const params: GetBoardsParams = {
        maxResults: 100,
        startAt: 0,
      };

      // Create 100 mock boards
      const mockBoards = {
        values: Array.from({ length: 100 }, (_, i) =>
          mockFactory.createMockBoard({
            id: i + 1,
            name: `Large Board ${i + 1}`,
            type: i % 3 === 0 ? "scrum" : i % 3 === 1 ? "kanban" : "simple",
          }),
        ),
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Large Board 1");
      expect(result.data).toContain("Large Board 100");
      expect(result.data).toContain("**100** boards");
    });

    test("should handle boards with minimal data", async () => {
      const mockBoards = {
        values: [
          {
            id: 1,
            name: "Minimal Board",
            type: "scrum",
            // Missing optional fields
          },
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Minimal Board");
      expect(result.data).toContain("scrum");
    });

    test("should handle boards with special characters", async () => {
      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
            type: "kanban",
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Special Chars");
      expect(result.data).toContain("kanban");
    });

    test("should handle empty search results with filters", async () => {
      const params: GetBoardsParams = {
        name: "nonexistent",
        type: "scrum",
        maxResults: 50,
        startAt: 0,
      };

      const mockBoards = { values: [] };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No boards found");
      expect(result.data).toContain("nonexistent");
      expect(result.data).toContain("scrum");
    });

    test("should handle boards with project information", async () => {
      const mockBoards = {
        values: [
          mockFactory.createMockBoard({
            id: 1,
            name: "Project Board",
            type: "scrum",
            location: {
              projectKey: "PROJ",
              projectName: "Test Project",
              projectId: 10001,
            },
          }),
        ],
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/agile/1.0/board", mockBoards);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("Project Board");
      expect(result.data).toContain("PROJ");
      expect(result.data).toContain("Test Project");
    });
  });
});
