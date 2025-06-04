import { logger } from "@core/logging";
/**
 * JIRA integration for MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools";

// Export domains
export * from "./issues";
export * from "./boards";
export * from "./projects";
export * from "./sprints";
export * from "./users";
export * from "./shared";

/**
 * Initializes the JIRA feature
 * @param server - The MCP server instance
 */
export function initializeJiraFeature(server: McpServer): void {
  try {
    registerTools(server);

    logger.info("JIRA feature initialized successfully", { prefix: "JIRA" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize JIRA feature: ${errorMessage}`, {
      prefix: "JIRA",
    });
  }
}
