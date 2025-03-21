/**
 * JIRA integration for MCP
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from './register-tools';
import { validateConfig } from './config/config';
import { logger } from '../../shared/logger';

/**
 * Initializes the JIRA feature
 * @param server - The MCP server instance
 */
export function initializeJiraFeature(server: McpServer): void {
  try {
    // Validate JIRA configuration on startup (warn but don't throw)
    validateConfig();
    
    // Register all tools with the MCP server
    registerTools(server);
    
    logger.info('JIRA feature initialized successfully', { 
      prefix: 'JIRA', 
      isMcp: true 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(new Error(`Failed to initialize JIRA feature: ${errorMessage}`), { 
      prefix: 'JIRA', 
      isMcp: true 
    });
  }
}

// Export types and utilities for external use
export * from './api/types';
export * from './validation/common-schemas';
export * from './tools/get-assigned-issues/get-assigned-issues.tool';
export * from './tools/get-issue/get-issue.tool';
export * from './tools/get-issue/get-issue.types';
export * from './tools/create-task/create-task.tool';
export * from './tools/create-task/create-task.types'; 