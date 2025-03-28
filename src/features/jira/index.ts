/**
 * JIRA integration for MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "@core/logging";
import { registerTools } from "./register-tools";

/**
 * Initializes the JIRA feature
 * @param server - The MCP server instance
 */
export function initializeJiraFeature(server: McpServer): void {
  try {
    // Register all tools with the MCP server
    registerTools(server);

    logger.info("JIRA feature initialized successfully", { prefix: "JIRA" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to initialize JIRA feature: ${errorMessage}`, {
      prefix: "JIRA",
    });
  }
}
