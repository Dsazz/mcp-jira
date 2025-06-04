/**
 * User Tools Configuration
 *
 * Defines configuration for all user-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "../types";

/**
 * User tools configuration factory
 * 
 * Creates tool configurations for all user-related tools
 */
export function createUserToolsConfig(tools: {
  jira_get_current_user: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_get_current_user",
      description: "Get current user profile information and permissions",
      params: {},
      handler: tools.jira_get_current_user.handle.bind(tools.jira_get_current_user),
    },
  ];
} 