/**
 * Sprint Tools Configuration
 *
 * Defines configuration for all sprint-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "../types";
import { getSprintsParamsSchema } from "../../sprints";

/**
 * Sprint tools configuration factory
 * 
 * Creates tool configurations for all sprint-related tools
 */
export function createSprintToolsConfig(tools: {
  jira_get_sprints: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_get_sprints",
      description: "Get all sprints for a specific JIRA board with filtering by state",
      params: getSprintsParamsSchema.shape,
      handler: tools.jira_get_sprints.handle.bind(tools.jira_get_sprints),
    },
  ];
} 