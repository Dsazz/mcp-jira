/**
 * Tool Registry
 *
 * Handles registration of JIRA tools with the MCP server
 */

import { logger } from "@core/logging";
import { adaptHandler } from "@core/responses";
import type { ToolConfig } from "@core/tools";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type {
  JiraTools,
  ToolConfigGroup,
  ToolRegistrationOptions,
} from "../types";

import {
  createBoardToolsConfig,
  createIssueToolsConfig,
  createProjectToolsConfig,
  createSprintToolsConfig,
  createUserToolsConfig,
  createWorklogToolsConfig,
} from "../configs";

/**
 * Register all JIRA tools with the MCP server
 *
 * @param server - MCP server instance
 * @param tools - JIRA tools to register
 * @param options - Registration options
 */
export function registerJiraTools(
  server: McpServer,
  tools: JiraTools,
  options: ToolRegistrationOptions = {},
): void {
  try {
    // Get all tool configurations
    const toolConfigs = getAllToolConfigs(tools);

    // Register each tool with the server
    registerToolConfigs(server, toolConfigs, options);

    logger.info("All JIRA tools registered successfully", { prefix: "JIRA" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register JIRA tools: ${errorMessage}`, {
      prefix: "JIRA",
    });
    throw new Error(`Failed to register JIRA tools: ${errorMessage}`);
  }
}

/**
 * Get all tool configurations organized by domain
 *
 * @param tools - JIRA tools
 * @returns Array of tool configuration groups
 */
export function getToolConfigGroups(tools: JiraTools): ToolConfigGroup[] {
  return [
    {
      groupName: "issues",
      configs: createIssueToolsConfig({
        jira_get_issue: tools.jira_get_issue,
        jira_get_issue_comments: tools.jira_get_issue_comments,
        jira_get_assigned_issues: tools.jira_get_assigned_issues,
        jira_create_issue: tools.jira_create_issue,
        jira_update_issue: tools.jira_update_issue,
        jira_search_issues: tools.jira_search_issues,
      }),
    },
    {
      groupName: "projects",
      configs: createProjectToolsConfig({
        jira_get_projects: tools.jira_get_projects,
      }),
    },
    {
      groupName: "boards",
      configs: createBoardToolsConfig({
        jira_get_boards: tools.jira_get_boards,
      }),
    },
    {
      groupName: "sprints",
      configs: createSprintToolsConfig({
        jira_get_sprints: tools.jira_get_sprints,
      }),
    },
    {
      groupName: "worklogs",
      configs: createWorklogToolsConfig({
        jira_add_worklog: tools.jira_add_worklog,
        jira_get_worklogs: tools.jira_get_worklogs,
        jira_update_worklog: tools.jira_update_worklog,
        jira_delete_worklog: tools.jira_delete_worklog,
      }),
    },
    {
      groupName: "users",
      configs: createUserToolsConfig({
        jira_get_current_user: tools.jira_get_current_user,
      }),
    },
  ];
}

/**
 * Get all tool configurations as a flat array
 *
 * @param tools - JIRA tools
 * @returns Array of all tool configurations
 */
function getAllToolConfigs(tools: JiraTools): ToolConfig[] {
  const configGroups = getToolConfigGroups(tools);
  return configGroups.flatMap((group) => group.configs);
}

/**
 * Register tool configurations with the MCP server
 *
 * @param server - MCP server instance
 * @param toolConfigs - Tool configurations to register
 * @param options - Registration options
 */
function registerToolConfigs(
  server: McpServer,
  toolConfigs: ToolConfig[],
  options: ToolRegistrationOptions,
): void {
  for (const config of toolConfigs) {
    // Validate configuration if requested
    if (options.validateConfigs) {
      validateToolConfig(config);
    }

    // Apply name prefix if specified
    const toolName = options.namePrefix
      ? `${options.namePrefix}${config.name}`
      : config.name;

    // Register the tool
    server.tool(
      toolName,
      config.description,
      config.params,
      adaptHandler(config.handler),
    );

    // Log registration if debug logging is enabled
    if (options.enableDebugLogging) {
      logger.debug(`Registered tool: ${toolName}`);
    }
  }
}

/**
 * Validate a tool configuration
 *
 * @param config - Tool configuration to validate
 * @throws Error if configuration is invalid
 */
function validateToolConfig(config: ToolConfig): void {
  if (!config.name || typeof config.name !== "string") {
    throw new Error("Tool configuration must have a valid name");
  }

  if (!config.description || typeof config.description !== "string") {
    throw new Error(`Tool ${config.name} must have a valid description`);
  }

  if (!config.params || typeof config.params !== "object") {
    throw new Error(`Tool ${config.name} must have valid params object`);
  }

  if (!config.handler || typeof config.handler !== "function") {
    throw new Error(`Tool ${config.name} must have a valid handler function`);
  }
}

/**
 * Get tool statistics
 *
 * @param tools - JIRA tools
 * @returns Statistics about registered tools
 */
export function getJiraToolStatistics(tools: JiraTools): {
  totalTools: number;
  toolsByGroup: Record<string, number>;
  toolNames: string[];
} {
  const configGroups = getToolConfigGroups(tools);
  const allConfigs = getAllToolConfigs(tools);

  const toolsByGroup = configGroups.reduce(
    (acc, group) => {
      acc[group.groupName] = group.configs.length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalTools: allConfigs.length,
    toolsByGroup,
    toolNames: allConfigs.map((config) => config.name),
  };
}
