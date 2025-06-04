/**
 * Project test utilities
 */
import type { McpResponse } from "@core/responses";
import type { Project } from "@features/jira/projects/models/project.models";

/**
 * Creates a standard project test response
 */
export function createProjectResponse(project: Project): McpResponse<Project> {
  return {
    success: true,
    data: project,
  };
}

/**
 * Creates a standard projects list test response
 */
export function createProjectsResponse(
  projects: Project[],
): McpResponse<Project[]> {
  return {
    success: true,
    data: projects,
  };
}
