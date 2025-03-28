/**
 * Features Module
 *
 * Feature modules for the MCP server
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "@core/logging";
import { initializeJiraFeature } from "./jira";

/**
 * Register all features with the MCP server
 *
 * @param server - The MCP server instance
 */
export async function registerFeatures(server: McpServer): Promise<void> {
  logger.info("Registering features...", { prefix: "Server" });

  try {
    // Register JIRA features
    initializeJiraFeature(server);

    logger.info("Features registered successfully", { prefix: "Server" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register features: ${errorMessage}`, {
      prefix: "Server",
    });
    throw error;
  }
}

// Export feature modules
export * from "./jira";
