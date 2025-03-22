/**
 * System Time MCP Module
 * Provides tools to handle system time functionalities
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetTimeTool } from './tools/get-time/get-time.tool';
import { SystemTimeConfig } from './config/system-time-config';
import { getLogger } from '../../shared/logging';
import { z } from 'zod';

/**
 * Register all System Time tools with the MCP server
 */
export function registerSystemTimeTools(server: McpServer): void {
  const systemTimeLogger = getLogger('SystemTime');
  systemTimeLogger.info('Registering System Time tools');
  
  // Create system time configuration
  const config = new SystemTimeConfig();
  
  // Log configuration status at startup
  systemTimeLogger.info('System Time configuration initialized', config.getDiagnostics());
  
  // Create tool instance
  const getTimeTool = new GetTimeTool(config);
  
  // Register tool with MCP
  server.tool(
    'get_system_time',
    'Retrieves the current system time in the specified format',
    {
      format: z.string().optional().describe('Date format string following date-fns format')
    },
    getTimeTool.handler.bind(getTimeTool)
  );
  
  systemTimeLogger.info('System Time tools registered successfully');
}

// Export tools and types for external use
export * from './tools/get-time/get-time.tool';
export * from './tools/get-time/get-time.types'; 