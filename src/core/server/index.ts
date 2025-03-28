import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
/**
 * Server Module
 *
 * Main exports for the server module
 */
import { normalizeError } from "../errors";
import { logger } from "../logging";
import { initializeServer } from "./server.lifecycle";

/**
 * Starts the MCP server with provided features registration function
 *
 * @param registerFeatures - Function to register features with the server
 */
export async function startServer(
  registerFeatures: (server: McpServer) => Promise<void>,
): Promise<void> {
  try {
    await initializeServer(registerFeatures);
  } catch (error) {
    const errorMessage = normalizeError(error);
    logger.error(`Failed to start MCP server: ${errorMessage}`, {
      prefix: "Server",
    });
    process.exit(1);
  }
}

export * from "./server.config";
export * from "./server.handlers";
export * from "./server.lifecycle";
