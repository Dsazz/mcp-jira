/**
 * Project mock factory for testing
 */
import { type Mock, mock } from "bun:test";
import type {
  GetProjectsOptions,
  Project,
  ProjectPermissions,
} from "@features/jira/projects/models";
import type { ProjectRepository } from "@features/jira/projects/repositories";

/**
 * Creates a mock project repository
 */
export function createMockProjectRepository() {
  return {
    getProjects: mock() as Mock<
      (options?: GetProjectsOptions) => Promise<Project[]>
    >,
    getProject: mock() as Mock<
      (projectKey: string, expand?: string[]) => Promise<Project>
    >,
    searchProjects: mock() as Mock<
      (query: string, maxResults?: number) => Promise<Project[]>
    >,
    getProjectPermissions: mock() as Mock<
      (projectKey: string) => Promise<ProjectPermissions>
    >,
  } as ProjectRepository;
}

/**
 * Creates a mock project
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "10000",
    key: "TEST",
    name: "Test Project",
    self: "https://test.atlassian.net/rest/api/3/project/10000",
    projectTypeKey: "software",
    simplified: true,
    style: "next-gen",
    isPrivate: false,
    ...overrides,
  };
}

/**
 * Creates a mock project list
 */
export function createMockProjectList(count = 3): Project[] {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      id: `${10000 + index}`,
      key: `TEST${index + 1}`,
      name: `Test Project ${index + 1}`,
      self: `https://test.atlassian.net/rest/api/3/project/${10000 + index}`,
      projectTypeKey: "software",
      simplified: true,
      style: "next-gen",
      isPrivate: false,
    }));
}
