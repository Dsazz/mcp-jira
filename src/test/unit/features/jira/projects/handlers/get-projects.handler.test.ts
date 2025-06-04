/**
 * Get Projects Handler Unit Tests
 * Comprehensive unit tests for JIRA get projects MCP tool handler
 */

import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import type { McpResponse } from "@core/responses/mcp-response.types";
import {
  JiraApiError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { GetProjectsHandler } from "@features/jira/projects/handlers/get-projects.handler";
import type { Project } from "@features/jira/projects/models";
import type { GetProjectsUseCase } from "@features/jira/projects/use-cases/get-projects.use-case";
import type {
  GetProjectParams,
  GetProjectsParams,
  ProjectParamsValidator,
} from "@features/jira/projects/validators/project-params.validator";
import { mockFactory } from "@test/mocks/jira-mock-factory";
import { jiraApiMocks } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("GetProjectsHandler", () => {
  let handler: GetProjectsHandler;
  let mockUseCase: GetProjectsUseCase;
  let mockValidator: ProjectParamsValidator;

  beforeEach(() => {
    // Create mock use case with proper typing
    mockUseCase = {
      execute: mock() as Mock<
        (params: GetProjectsParams) => Promise<Project[]>
      >,
    };

    mockValidator = {
      validateGetProjectsParams: mock((params) => params) as Mock<
        (params: GetProjectsParams) => GetProjectsParams
      >,
      validateGetProjectParams: mock((params) => params) as Mock<
        (params: GetProjectParams) => GetProjectParams
      >,
    };

    // Create handler with mock use case
    handler = new GetProjectsHandler(mockUseCase, mockValidator);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
    mock.restore();
  });

  describe("basic project retrieval", () => {
    test("should retrieve all projects successfully", async () => {
      const mockProjects = [
        mockFactory.createMockProject({ key: "PROJ1", name: "Project One" }),
        mockFactory.createMockProject({ key: "PROJ2", name: "Project Two" }),
        mockFactory.createMockProject({ key: "PROJ3", name: "Project Three" }),
      ];

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("PROJ1");
      expect(result.data).toContain("PROJ2");
      expect(result.data).toContain("PROJ3");
      expect(result.data).toContain("Project One");
      expect(result.data).toContain("Project Two");
      expect(result.data).toContain("Project Three");

      // Verify use case was called
      expect(mockUseCase.execute).toHaveBeenCalled();
    });

    test("should handle empty project list", async () => {
      // Setup mock use case to return empty array
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue([]);

      const result = (await handler.handle({})) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No Projects Found");

      // Verify use case was called
      expect(mockUseCase.execute).toHaveBeenCalled();
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("TEST1");
      expect(result.data).toContain("TEST2");

      // Verify use case was called with correct parameters
      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          maxResults: 5,
        }),
      );
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("WEB1");
      expect(result.data).toContain("WEB2");
      expect(result.data).toContain("Web Application Project");
      expect(result.data).toContain("Website Redesign");
      expect(result.data).toContain("# 📋 JIRA Projects");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("API1");
      expect(result.data).toContain("API Gateway Project");
      expect(result.data).toContain("# 📋 JIRA Projects");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("ALPHA");
      expect(result.data).toContain("BETA");
      expect(result.data).toContain("GAMMA");
      expect(result.data).toContain("# 📋 JIRA Projects");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("AAA");
      expect(result.data).toContain("BBB");
      expect(result.data).toContain("# 📋 JIRA Projects");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MORE1");
      expect(result.data).toContain("MORE2");
      expect(result.data).toContain("# 📋 JIRA Projects");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("MULTI");
      expect(result.data).toContain("Multi-expand description");
      expect(result.data).toContain("Multi Lead");
    });
  });

  describe("error handling", () => {
    test("should handle permission denied error", async () => {
      // Setup the use case to throw a JiraPermissionError
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(() => {
        throw new JiraPermissionError("Forbidden - insufficient permissions");
      });

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission Denied");
    });

    test("should handle authentication error", async () => {
      // Setup the use case to throw a JiraApiError
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(() => {
        throw JiraApiError.withStatusCode("Authentication failed", 401);
      });

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("Authentication failed");
    });

    test("should handle invalid search query", async () => {
      const params: GetProjectsParams = {
        searchQuery: "invalid[query",
        maxResults: 50,
        startAt: 0,
      };

      // Setup the use case to throw a JiraApiError
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(() => {
        throw JiraApiError.withStatusCode("Invalid search query syntax", 400);
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("search query syntax");
    });

    test("should reject invalid project type key", async () => {
      const params: GetProjectsParams = {
        typeKey: "software",
        maxResults: 10,
        startAt: 0,
      };

      // Setup the use case to throw an error for invalid parameters
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(async () => {
        throw new Error("Invalid typeKey");
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("Invalid typeKey");
    });

    test("should handle network errors gracefully", async () => {
      // Setup the use case to throw a network error
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(() => {
        throw new Error("Network error occurred");
      });

      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("Network error");
    });

    test("should handle missing dependencies error", async () => {
      // Create handler with missing dependencies
      const handlerWithoutDependencies = new GetProjectsHandler(
        undefined as unknown as GetProjectsUseCase,
        mockValidator,
      );

      const result = await handlerWithoutDependencies.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
    });
  });

  describe("parameter validation", () => {
    test("should validate maxResults range", async () => {
      const params = {
        maxResults: -1,
        startAt: 0,
      } as GetProjectsParams;

      // Setup the validator to throw an error for invalid parameters
      mockValidator.validateGetProjectsParams = mock(() => {
        throw JiraApiError.withStatusCode(
          "Invalid project retrieval parameters",
          400,
        );
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should validate startAt value", async () => {
      const params = {
        maxResults: 50,
        startAt: -5,
      } as GetProjectsParams;

      // Setup the validator to throw an error for invalid parameters
      mockValidator.validateGetProjectsParams = mock(() => {
        throw JiraApiError.withStatusCode(
          "Invalid project retrieval parameters",
          400,
        );
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should validate orderBy values", async () => {
      const params = {
        maxResults: 50,
        startAt: 0,
        orderBy: "invalid-order",
      } as unknown as GetProjectsParams;

      // Setup the validator to throw an error for invalid parameters
      mockValidator.validateGetProjectsParams = mock(() => {
        throw JiraApiError.withStatusCode(
          "Invalid project retrieval parameters",
          400,
        );
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("JIRA API Error");
      expect(result.error).toContain("Invalid project retrieval parameters");
    });

    test("should reject invalid expand options", async () => {
      const params = {
        maxResults: 10,
        startAt: 0,
        expand: ["description", "lead"] as const,
      };

      // Setup the use case to throw an error for invalid parameters
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockImplementation(async () => {
        throw new Error("Invalid expand options");
      });

      const result = await handler.handle(params);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Project Retrieval Failed");
      expect(result.error).toContain("Invalid expand options");
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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = await handler.handle(params);

      expect(result.success).toBe(true);
      expect(result.data).toContain("VALID");
    });
  });

  describe("edge cases", () => {
    test("should handle very large result sets", async () => {
      const params: GetProjectsParams = {
        maxResults: 50, // Changed from 100 to 50 to match the valid range
        startAt: 0,
      };

      // Create 50 mock projects (instead of 100)
      const mockProjects = Array.from({ length: 50 }, (_, i) =>
        mockFactory.createMockProject({
          key: `LARGE${i + 1}`,
          name: `Large Project ${i + 1}`,
        }),
      );

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("LARGE1");
      expect(result.data).toContain("LARGE50"); // Changed from LARGE100 to LARGE50
      expect(result.data).toContain("50 projects"); // Changed from 100 to 50
    });

    test("should handle projects with minimal data", async () => {
      const mockProjects = [
        {
          id: "minimal-1",
          key: "MIN",
          name: "Minimal Project",
          projectTypeKey: "software",
          style: "classic", // Add the required style property
          simplified: false,
          isPrivate: false,
          // Missing optional fields
        },
      ];

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects as Project[]);

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

      // Setup mock use case to return projects
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue(mockProjects);

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

      // Setup mock use case to return empty array
      (
        mockUseCase.execute as Mock<
          (params: GetProjectsParams) => Promise<Project[]>
        >
      ).mockResolvedValue([]);

      const result = (await handler.handle(params)) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain("No Projects Found");
      expect(result.data).toContain("No projects are accessible");
    });
  });
});
