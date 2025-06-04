/**
 * Project mock factory for testing
 */
import { mock } from "bun:test";
import type { Project } from "@features/jira/projects/models/project.models";
import type { ProjectRepository } from "@features/jira/shared/repositories";

/**
 * Creates a mock project repository
 */
export function createMockProjectRepository() {
  return {
    getProjects: mock(),
    getProject: mock(),
  } as unknown as ProjectRepository;
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
    ...overrides
  };
}

/**
 * Creates a mock project list
 */
export function createMockProjectList(count = 3): Project[] {
  return Array(count).fill(null).map((_, index) => ({
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
