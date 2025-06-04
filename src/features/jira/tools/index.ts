/**
 * JIRA Tools
 *
 * Main entry point for JIRA tools functionality
 * Provides a simplified API for creating and registering JIRA tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JiraConfig } from "../client/config";
import { createJiraDependencies, createJiraTools } from "./factories";
import { getJiraToolStatistics, registerJiraTools } from "./registry";
import { logger } from "@core/logging";

// Export all types
export type * from "./types";

// Export factories
export { createJiraDependencies, createJiraTools } from "./factories";
export type { JiraDependencies } from "./factories";

// Export registry
export {
  registerJiraTools,
  getToolConfigGroups,
  getJiraToolStatistics,
} from "./registry";

// Export configuration functions
export * from "./configs";

/**
 * Create JIRA tools with dependency injection
 *
 * Simplified factory function that creates all JIRA tools with proper dependencies
 *
 * @param config - JIRA configuration
 * @returns Complete set of JIRA tool handlers
 */
export function createJiraToolsWithDI(config: JiraConfig) {
  logger.info("Creating JIRA tools with dependency injection", {
    prefix: "JIRA",
  });
  // log the config
  logger.info("JIRA config", { config, prefix: "JIRA" });
  const dependencies = createJiraDependencies(config);
  return createJiraTools(dependencies);
}

/**
 * Register JIRA tools with MCP server
 *
 * Simplified registration function that creates and registers all JIRA tools
 *
 * @param server - MCP server instance
 * @param config - JIRA configuration (optional, defaults to environment config)
 */
export function registerTools(server: McpServer, config?: JiraConfig): void {
  const jiraConfig = config ?? JiraConfig.fromEnv();
  const tools = createJiraToolsWithDI(jiraConfig);
  registerJiraTools(server, tools);
}

/**
 * Get tool statistics
 *
 * @param config - JIRA configuration (optional, defaults to environment config)
 * @returns Statistics about available JIRA tools
 */
export function getToolStatistics(config?: JiraConfig) {
  const jiraConfig = config ?? JiraConfig.fromEnv();
  const tools = createJiraToolsWithDI(jiraConfig);
  return getJiraToolStatistics(tools);
}
