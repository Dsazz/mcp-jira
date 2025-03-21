import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSystemTimeHandler } from './handlers/get-time.handler';
import { registerSystemTimeRoutes } from './routes';

export function initializeSystemTimeFeature(server: McpServer): void {
  // Register all system-time related routes
  registerSystemTimeRoutes(server);
}

// Export handlers for external use if needed
export { getSystemTimeHandler };

// Export types
export * from './types'; 