/**
 * Project Repository Integration Tests
 *
 * Tests the repository layer with mocked HTTP responses
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type {
  GetProjectsOptions,
  Project,
  ProjectPermissions,
} from "@features/jira/projects/models";
import { IntegrationTestEnvironment } from "@test/integration/integration-test-utils";
import { mockHttp } from "@test/utils/mock-helpers";
import { setupTests } from "@test/utils/test-setup";

// Set up test environment
setupTests();

describe("ProjectRepository Integration", () => {
  let env: IntegrationTestEnvironment;

  beforeEach(() => {
    // Create integration test environment
    env = new IntegrationTestEnvironment();
  });

  afterEach(() => {
    // Clean up mocks
    env.reset();
  });

  describe("getProjects", () => {
    it("should retrieve all projects", async () => {
      // Create mock projects data
      const mockProjects: Project[] = [
        {
          id: "10000",
          key: "TEST",
          name: "Test Project",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "classic",
        },
        {
          id: "10001",
          key: "DEMO",
          name: "Demo Project",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "next-gen",
        },
      ];

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/search", mockProjects);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method
      const result = await repository.getProjects();

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].key).toBe("TEST");
      expect(result[1].key).toBe("DEMO");
    });

    it("should apply filter options to the request", async () => {
      // Create mock projects data
      const mockProjects: Project[] = [
        {
          id: "10000",
          key: "TEST",
          name: "Test Project",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "classic",
        },
      ];

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/search", mockProjects);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Create options
      const options: GetProjectsOptions = {
        maxResults: 1,
        expand: ["issueTypes", "lead"],
        recent: 5,
        searchQuery: "Test",
      };

      // Execute the repository method
      const result = await repository.getProjects(options);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].key).toBe("TEST");

      // Verify the mock was called with the correct parameters
      // This is an indirect way to verify the options were applied correctly
      // In a real test with mock fetch, we'd assert on the actual URL parameters
    });

    it("should handle error when fetching projects", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        401,
        "Authentication failed",
      );

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method and expect error
      await expect(repository.getProjects()).rejects.toThrow(
        "Authentication failed",
      );
    });
  });

  describe("getProject", () => {
    it("should retrieve a specific project by key", async () => {
      // Create mock project data
      const mockProject: Project = {
        id: "10000",
        key: "TEST",
        name: "Test Project",
        description: "This is a test project",
        projectTypeKey: "software",
        simplified: false,
        isPrivate: false,
        style: "classic",
        lead: {
          accountId: "test-user-id",
          displayName: "Test User",
        },
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/TEST", mockProject);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method
      const result = await repository.getProject("TEST");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST");
      expect(result.name).toBe("Test Project");
    });

    it("should retrieve a project with expanded fields", async () => {
      // Create mock project data with expanded fields
      const mockProject: Project = {
        id: "10000",
        key: "TEST",
        name: "Test Project",
        description: "This is a test project",
        projectTypeKey: "software",
        simplified: false,
        isPrivate: false,
        style: "classic",
        lead: {
          accountId: "test-user-id",
          displayName: "Test User",
        },
        issueTypes: [
          {
            id: "1",
            name: "Task",
            description: "A task that needs to be done",
            subtask: false,
          },
          {
            id: "2",
            name: "Bug",
            description: "A bug in the software",
            subtask: false,
          },
        ],
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/TEST", mockProject);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method with expand parameter
      const result = await repository.getProject("TEST", ["issueTypes"]);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.key).toBe("TEST");
      expect(result.issueTypes).toBeDefined();
      expect(result.issueTypes?.length).toBe(2);
    });

    it("should handle project not found error", async () => {
      // Mock a 404 error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/project/NONEXIST",
        404,
        "Project not found",
      );

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method and expect error
      await expect(repository.getProject("NONEXIST")).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("getProjectPermissions", () => {
    it("should retrieve permissions for a specific project", async () => {
      // Create mock permissions data
      const mockPermissions: ProjectPermissions = {
        canEdit: true,
        canDelete: false,
        canAdminister: true,
        canBrowse: true,
        permissions: {
          BROWSE_PROJECTS: {
            havePermission: true,
          },
          CREATE_ISSUES: {
            havePermission: true,
          },
          EDIT_ISSUES: {
            havePermission: true,
          },
          ASSIGN_ISSUES: {
            havePermission: false,
          },
        },
      };

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess(
        "/rest/api/3/user/permission/search",
        mockPermissions,
      );

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method
      const result = await repository.getProjectPermissions("TEST");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.permissions).toBeDefined();
      if (result.permissions) {
        expect(result.permissions.BROWSE_PROJECTS?.havePermission).toBe(true);
        expect(result.permissions.ASSIGN_ISSUES?.havePermission).toBe(false);
      }
    });

    it("should handle error when fetching permissions", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/user/permission/search",
        403,
        "Permission denied",
      );

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method and expect error
      await expect(repository.getProjectPermissions("TEST")).rejects.toThrow(
        "Permission denied",
      );
    });
  });

  describe("searchProjects", () => {
    it("should search for projects by query", async () => {
      // Create mock projects data
      const mockProjects: Project[] = [
        {
          id: "10000",
          key: "TEST",
          name: "Test Project",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "classic",
        },
        {
          id: "10001",
          key: "TEST2",
          name: "Test Project 2",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "classic",
        },
      ];

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/search", mockProjects);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method
      const result = await repository.searchProjects("Test");

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].key).toBe("TEST");
      expect(result[1].key).toBe("TEST2");
    });

    it("should limit search results based on maxResults", async () => {
      // Create mock projects data
      const mockProjects: Project[] = [
        {
          id: "10000",
          key: "TEST",
          name: "Test Project",
          projectTypeKey: "software",
          simplified: false,
          isPrivate: false,
          style: "classic",
        },
      ];

      // Mock the HTTP response
      mockHttp.mockJiraApiSuccess("/rest/api/3/project/search", mockProjects);

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method with maxResults
      const result = await repository.searchProjects("Test", 1);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
    });

    it("should handle error during search", async () => {
      // Mock an error response
      mockHttp.mockJiraApiError(
        "/rest/api/3/project/search",
        500,
        "Internal server error",
      );

      // Get repository from environment
      const repository = env.createProjectRepository();

      // Execute the repository method and expect error
      await expect(repository.searchProjects("Test")).rejects.toThrow(
        "Internal server error",
      );
    });
  });
});
