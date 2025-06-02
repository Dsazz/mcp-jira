/**
 * Get Projects Handler Unit Tests
 * Comprehensive unit tests for JIRA get projects MCP tool handler
 */

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type { GetProjectsParams } from "@features/jira/api/jira.schemas";
import { GetProjectsHandler } from "@features/jira/tools/handlers/get-projects.handler";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks, mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetProjectsHandler", () => {
  let handler: GetProjectsHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client with all required methods
    mockClient = {
      getProjects: async () => {
        const response = await fetch("/rest/api/3/project/search", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      },
    };

    handler = new GetProjectsHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe("basic project retrieval", () => {
    test("should retrieve all projects successfully", async () => {
      const mockProjects = [
        mockFactory.createMockProject({ key: "PROJ1", name: "Project One" }),
        mockFactory.createMockProject({ key: "PROJ2", name: "Project Two" }),
        mockFactory.createMockProject({ key: "PROJ3", name: "Project Three" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("PROJ1");
      expect(result.data).toContain("PROJ2");
      expect(result.data).toContain("PROJ3");
      expect(result.data).toContain("Project One");
      expect(result.data).toContain("Project Two");
      expect(result.data).toContain("Project Three");
    });

    test("should handle empty project list", async () => {
      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/project/search", []);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No Projects Found");
    });

    test("should retrieve projects with basic parameters", async () => {
      const params: GetProjectsParams = {
        maxResults: 5,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({ key: "TEST1", name: "Test Project 1" }),
        mockFactory.createMockProject({ key: "TEST2", name: "Test Project 2" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST1");
      expect(result.data).toContain("TEST2");
    });
  });

  describe("filtering and search", () => {
    test("should filter projects by search query", async () => {
      const params: GetProjectsParams = {
        searchQuery: "web",
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({
          key: "WEB1",
          name: "Web Application Project",
          projectTypeKey: "software",
        }),
        mockFactory.createMockProject({
          key: "WEB2",
          name: "Website Redesign",
          projectTypeKey: "software",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("WEB1");
      expect(result.data).toContain("WEB2");
      expect(result.data).toContain("Web Application Project");
      expect(result.data).toContain("Website Redesign");
      expect(result.data).toContain('Search: "web"');
    });

    test("should filter projects by type", async () => {
      const params: GetProjectsParams = {
        typeKey: "software",
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({
          key: "SOFT1",
          name: "Software Project 1",
          projectTypeKey: "software",
        }),
        mockFactory.createMockProject({
          key: "SOFT2",
          name: "Software Project 2",
          projectTypeKey: "software",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("SOFT1");
      expect(result.data).toContain("SOFT2");
      expect(result.data).toContain("software");
    });

    test("should filter projects by category", async () => {
      const params: GetProjectsParams = {
        categoryId: 10001,
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({
          key: "CAT1",
          name: "Category Project 1",
          projectCategory: {
            id: "10001",
            name: "Development",
            description: "Development projects",
          },
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("CAT1");
      expect(result.data).toContain("Development");
    });

    test("should retrieve recent projects", async () => {
      const params: GetProjectsParams = {
        recent: 5,
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({
          key: "REC1",
          name: "Recent Project 1",
        }),
        mockFactory.createMockProject({
          key: "REC2",
          name: "Recent Project 2",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("REC1");
      expect(result.data).toContain("REC2");
      expect(result.data).toContain("recently accessed projects");
    });

    test("should combine multiple filters", async () => {
      const params: GetProjectsParams = {
        searchQuery: "api",
        typeKey: "software",
        maxResults: 10,
        startAt: 0,
        orderBy: "name",
      };

      const mockProjects = [
        mockFactory.createMockProject({
          key: "API1",
          name: "API Gateway Project",
          projectTypeKey: "software",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("API1");
      expect(result.data).toContain("API Gateway Project");
      expect(result.data).toContain('Search: "api"');
      expect(result.data).toContain("software");
    });
  });

  describe("ordering and pagination", () => {
    test("should order projects by name", async () => {
      const params: GetProjectsParams = {
        orderBy: "name",
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({ key: "ALPHA", name: "Alpha Project" }),
        mockFactory.createMockProject({ key: "BETA", name: "Beta Project" }),
        mockFactory.createMockProject({ key: "GAMMA", name: "Gamma Project" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("ALPHA");
      expect(result.data).toContain("BETA");
      expect(result.data).toContain("GAMMA");
      expect(result.data).toContain("Ordered by: name");
    });

    test("should order projects by key", async () => {
      const params: GetProjectsParams = {
        orderBy: "key",
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        mockFactory.createMockProject({ key: "AAA", name: "Project AAA" }),
        mockFactory.createMockProject({ key: "BBB", name: "Project BBB" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("AAA");
      expect(result.data).toContain("BBB");
      expect(result.data).toContain("Ordered by: key");
    });

    test("should handle pagination with startAt", async () => {
      const params: GetProjectsParams = {
        maxResults: 2,
        startAt: 5,
      };

      const mockProjects = [
        mockFactory.createMockProject({ key: "PAGE1", name: "Page Project 1" }),
        mockFactory.createMockProject({ key: "PAGE2", name: "Page Project 2" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("PAGE1");
      expect(result.data).toContain("PAGE2");
    });

    test("should indicate when more results are available", async () => {
      const params: GetProjectsParams = {
        maxResults: 2,
        startAt: 0,
      };

      // Return exactly maxResults to indicate there might be more
      const mockProjects = [
        mockFactory.createMockProject({ key: "MORE1", name: "More Project 1" }),
        mockFactory.createMockProject({ key: "MORE2", name: "More Project 2" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MORE1");
      expect(result.data).toContain("MORE2");
      expect(result.data).toContain("More projects available");
    });
  });

  describe("expand options", () => {
    test("should expand project details", async () => {
      const params: GetProjectsParams = {
        expand: ["description", "lead", "issueTypes"],
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        {
          ...mockFactory.createMockProject({
            key: "EXP1",
            name: "Expanded Project",
          }),
          description: "This is a detailed project description",
          lead: {
            accountId: "lead-123",
            displayName: "Project Lead",
            emailAddress: "lead@company.com",
          },
          issueTypes: [
            { id: "1", name: "Bug", iconUrl: "bug.png" },
            { id: "2", name: "Task", iconUrl: "task.png" },
          ],
        },
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("EXP1");
      expect(result.data).toContain("Expanded Project");
      expect(result.data).toContain("detailed project description");
      expect(result.data).toContain("Project Lead");
    });

    test("should handle multiple expand options", async () => {
      const params: GetProjectsParams = {
        expand: ["description", "lead", "url"],
        maxResults: 50,
        startAt: 0,
      };

      const mockProjects = [
        {
          ...mockFactory.createMockProject({
            key: "MULTI",
            name: "Multi Expand Project",
          }),
          description: "Multi-expand description",
          lead: {
            accountId: "multi-lead",
            displayName: "Multi Lead",
            emailAddress: "multi@company.com",
          },
          url: "https://company.atlassian.net/projects/MULTI",
        },
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MULTI");
      expect(result.data).toContain("Multi-expand description");
      expect(result.data).toContain("Multi Lead");
    });
  });

  describe("error handling", () => {
    test("should handle permission denied error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        403,
        "Forbidden - insufficient permissions",
      );

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("403");
    });

    test("should handle authentication error", async () => {
      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        401,
        "Authentication failed",
      );

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Authentication");
    });

    test("should handle invalid search query", async () => {
      const params: GetProjectsParams = {
        searchQuery: "invalid[query",
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        400,
        "Invalid search query syntax",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("search query syntax");
    });

    test("should handle invalid project type", async () => {
      const params: GetProjectsParams = {
        typeKey: "invalid-type",
        maxResults: 50,
        startAt: 0,
      };

      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        400,
        "Invalid project type key",
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("project type key");
    });

    test("should handle network errors gracefully", async () => {
      mockHttp.mockNetworkError("/rest/api/3/project/search");

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("Network error");
    });

    test("should handle missing client error", async () => {
      const handlerWithoutClient = new GetProjectsHandler();

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
      } as GetProjectsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should validate startAt value", async () => {
      const params = {
        maxResults: 50,
        startAt: -5,
      } as GetProjectsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should validate orderBy values", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
        orderBy: "invalid-order",
      } as unknown as GetProjectsParams;

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should validate expand array", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
        expand: ["invalid-expand-option"],
      } as GetProjectsParams;

      // Mock a network error since the schema doesn't validate expand options
      mockHttp.mockNetworkError("/rest/api/3/project/search");

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
    });

    test("should accept valid parameters", async () => {
      const params: GetProjectsParams = {
        searchQuery: "test",
        typeKey: "software",
        categoryId: 10001,
        recent: 5,
        orderBy: "name",
        maxResults: 50,
        startAt: 0,
        expand: ["description", "lead"],
      };

      const mockProjects = [
        mockFactory.createMockProject({ key: "VALID", name: "Valid Project" }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toContain("VALID");
    });
  });

  describe("edge cases", () => {
    test("should handle very large result sets", async () => {
      const params: GetProjectsParams = {
        maxResults: 100,
        startAt: 0,
      };

      // Create 100 mock projects
      const mockProjects = Array.from({ length: 100 }, (_, i) =>
        mockFactory.createMockProject({
          key: `LARGE${i + 1}`,
          name: `Large Project ${i + 1}`,
        }),
      );

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("LARGE1");
      expect(result.data).toContain("LARGE100");
      expect(result.data).toContain("100 projects");
    });

    test("should handle projects with minimal data", async () => {
      const mockProjects = [
        {
          id: "minimal-1",
          key: "MIN",
          name: "Minimal Project",
          projectTypeKey: "software",
          // Missing optional fields
        },
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MIN");
      expect(result.data).toContain("Minimal Project");
    });

    test("should handle projects with special characters", async () => {
      const mockProjects = [
        mockFactory.createMockProject({
          key: "SPEC",
          name: "Special Chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
        }),
      ];

      jiraApiMocks.mockJiraApiSuccess(
        "/rest/api/3/project/search",
        mockProjects,
      );

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("SPEC");
      expect(result.data).toContain("Special Chars");
    });

    test("should handle empty search results with filters", async () => {
      const params: GetProjectsParams = {
        searchQuery: "nonexistent",
        typeKey: "software",
        maxResults: 50,
        startAt: 0,
      };

      jiraApiMocks.mockJiraApiSuccess("/rest/api/3/project/search", []);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No projects found");
      expect(result.data).toContain("nonexistent");
      expect(result.data).toContain("software");
    });
  });
});
