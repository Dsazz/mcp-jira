import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { initializeSystemTimeFeature } from '../../features/system-time';
import { initializeJiraFeature } from '../../features/jira';
import { logger } from '../../shared/logger';

export async function registerFeatures(server: McpServer): Promise<void> {
  logger.info('Registering features...', { prefix: 'Server', isMcp: true });
  
  try {
    // Initialize system time feature
    initializeSystemTimeFeature(server);
    
    // Initialize Jira feature
    initializeJiraFeature(server);
    
    logger.info('Features registered successfully', { prefix: 'Server', isMcp: true });
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'Server', 
      isMcp: true 
    });
    throw error;
  }
} 