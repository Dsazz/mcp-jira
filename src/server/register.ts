import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSystemTimeTools } from '../features/system-time';
import { initializeJiraFeature } from '../features/jira';
import { logger } from '../shared/logging';

/**
 * Registers all features with the MCP server
 */
export async function registerFeatures(server: McpServer): Promise<void> {
  logger.info('Registering features...', { prefix: 'Server' });
  
  try {
    // Register system time tools
    registerSystemTimeTools(server);
    
    // Initialize Jira feature
    initializeJiraFeature(server);
    
    logger.info('Features registered successfully', { prefix: 'Server' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to register features: ${errorMessage}`, { 
      prefix: 'Server'
    });
    throw error;
  }
} 