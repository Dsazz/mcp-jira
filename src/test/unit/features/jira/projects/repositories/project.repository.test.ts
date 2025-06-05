/**
 * Project Repository Unit Tests
 * Tests for JIRA project repository with paginated response handling
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
import type {
  HttpClient,
  HttpRequestOptions,
} from "@features/jira/client/http/jira.http.types";
import type { ProjectSearchResponse } from "@features/jira/projects/models";
import { ProjectRepositoryImpl } from "@features/jira/projects/repositories/project.repository";
import {
  createMockProject,
  createMockProjectSearchResponse,
} from "@test/mocks/projects/project-mock-factory";
import { setupTests } from "@test/utils/test-setup";

// Setup test environment
setupTests();

describe("ProjectRepositoryImpl", () => {
  let repository: ProjectRepositoryImpl;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      sendRequest: mock() as Mock<
        (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
      >,
      getBaseUrl: mock(() => "https://test.atlassian.net"),
    } as HttpClient;

    repository = new ProjectRepositoryImpl(mockHttpClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("getProjects", () => {
    test("should extract projects from paginated response", async () => {
      const mockProjects = [
        createMockProject({ key: "PROJ1", name: "Project 1" }),
        createMockProject({ key: "PROJ2", name: "Project 2" }),
      ];

      const mockResponse = createMockProjectSearchResponse(mockProjects);

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      const result = await repository.getProjects();

      expect(result).toEqual(mockProjects);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: "project/search",
        method: "GET",
        queryParams: {},
      });
    });

    test("should handle empty paginated response", async () => {
      const mockResponse = createMockProjectSearchResponse([]);

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      const result = await repository.getProjects();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    test("should pass query parameters correctly", async () => {
      const mockProjects = [createMockProject()];
      const mockResponse = createMockProjectSearchResponse(mockProjects);

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      await repository.getProjects({
        maxResults: 10,
        startAt: 5,
        searchQuery: "test",
        typeKey: "software",
      });

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: "project/search",
        method: "GET",
        queryParams: {
          maxResults: 10,
          startAt: 5,
          query: "test",
          typeKey: "software",
        },
      });
    });
  });

  describe("searchProjects", () => {
    test("should extract projects from paginated search response", async () => {
      const mockProjects = [
        createMockProject({ key: "SEARCH1", name: "Search Result 1" }),
      ];

      const mockResponse = createMockProjectSearchResponse(mockProjects);

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      const result = await repository.searchProjects("test query");

      expect(result).toEqual(mockProjects);
      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: "project/search",
        method: "GET",
        queryParams: {
          query: "test query",
          maxResults: 50,
        },
      });
    });

    test("should handle custom maxResults in search", async () => {
      const mockResponse = createMockProjectSearchResponse([]);

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      await repository.searchProjects("test", 25);

      expect(mockHttpClient.sendRequest).toHaveBeenCalledWith({
        endpoint: "project/search",
        method: "GET",
        queryParams: {
          query: "test",
          maxResults: 25,
        },
      });
    });
  });

  describe("pagination handling", () => {
    test("should handle large paginated response", async () => {
      const mockProjects = Array(100)
        .fill(null)
        .map((_, i) =>
          createMockProject({ key: `PROJ${i}`, name: `Project ${i}` }),
        );

      const mockResponse = createMockProjectSearchResponse(mockProjects, {
        startAt: 0,
        maxResults: 100,
        total: 250,
        isLast: false,
      });

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      const result = await repository.getProjects({ maxResults: 100 });

      expect(result).toEqual(mockProjects);
      expect(result.length).toBe(100);
    });

    test("should handle last page of paginated response", async () => {
      const mockProjects = [
        createMockProject({ key: "LAST1", name: "Last Project 1" }),
        createMockProject({ key: "LAST2", name: "Last Project 2" }),
      ];

      const mockResponse = createMockProjectSearchResponse(mockProjects, {
        startAt: 98,
        maxResults: 50,
        total: 100,
        isLast: true,
      });

      (
        mockHttpClient.sendRequest as Mock<
          (options: HttpRequestOptions) => Promise<ProjectSearchResponse>
        >
      ).mockResolvedValue(mockResponse);

      const result = await repository.getProjects({
        startAt: 98,
        maxResults: 50,
      });

      expect(result).toEqual(mockProjects);
      expect(result.length).toBe(2);
    });
  });
});
