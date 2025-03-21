import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SystemTimeSchema } from './types';
import { getSystemTimeHandler } from './handlers/get-time.handler';
import { logger } from "../../shared/logger";

export function registerSystemTimeRoutes(server: McpServer): void {
  try {
    server.tool(
      "get_system_time",
      { format: SystemTimeSchema.shape.format },
      async (params) => getSystemTimeHandler({ format: params.format })
    );

    logger.info('System Time routes registered successfully', { 
      prefix: 'System Time Routes', 
      isMcp: true 
    });
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'System Time Routes', 
      isMcp: true 
    });
    throw error;
  }
} 