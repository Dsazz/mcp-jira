/**
 * Project test utilities
 */
import type { Project } from "@features/jira/projects/models/project.models";
import type { McpResponse } from "@core/responses/mcp-response";

/**
 * Creates a standard project test response
 */
export function createProjectResponse(project: Project): McpResponse<Project> {
  return {
    success: true,
    data: project,
    error: null
  };
}

/**
 * Creates a standard projects list test response
 */
export function createProjectsResponse(projects: Project[]): McpResponse<Project[]> {
  return {
    success: true,
    data: projects,
    error: null
  };
}
