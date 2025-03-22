/**
 * JIRA integration for MCP
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from './register-tools';
import { JiraConfig } from './config/jira-config';
import { getLogger } from '../../shared/logging';

/**
 * Initializes the JIRA feature
 * @param server - The MCP server instance
 */
export function initializeJiraFeature(server: McpServer): void {
  const jiraLogger = getLogger('JIRA');
  
  try {
    // Create and validate JIRA configuration
    const config = new JiraConfig();
    
    // Log configuration status
    jiraLogger.info('JIRA configuration loaded', config.getDiagnostics());
    
    // Register all tools with the MCP server (passing the config)
    registerTools(server, config);
    
    jiraLogger.info('JIRA feature initialized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    jiraLogger.error(`Failed to initialize JIRA feature: ${errorMessage}`);
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