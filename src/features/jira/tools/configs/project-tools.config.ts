/**
 * Project Tools Configuration
 *
 * Defines configuration for all project-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "../types";
import { getProjectsParamsSchema } from "../../projects";

/**
 * Project tools configuration factory
 * 
 * Creates tool configurations for all project-related tools
 */
export function createProjectToolsConfig(tools: {
  jira_get_projects: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_get_projects",
      description: "Get all accessible JIRA projects with filtering and search capabilities",
      params: getProjectsParamsSchema.shape,
      handler: tools.jira_get_projects.handle.bind(tools.jira_get_projects),
    },
  ];
} 