/**
 * Registers JIRA tools with MCP server
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetAssignedIssuesTool } from './tools/get-assigned-issues/get-assigned-issues.tool';
import { GetIssueTool } from './tools/get-issue/get-issue.tool';
import { CreateTaskTool } from './tools/create-task/create-task.tool';
import { issueKeySchema } from './validation/common-schemas';
import { logger } from '../../shared/logger';

/**
 * Registers all JIRA tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  try {
    // Initialize tools
    const getAssignedIssuesTool = new GetAssignedIssuesTool();
    const getIssueTool = new GetIssueTool();
    const createTaskTool = new CreateTaskTool();

    // Tool for getting assigned issues
    server.tool(
      'jira_get_assigned_issues',
      'Retrieves all JIRA issues assigned to the current user',
      {},
      getAssignedIssuesTool.handler.bind(getAssignedIssuesTool)
    );
    
    // Tool for getting a specific issue
    server.tool(
      'jira_get_issue',
      'Retrieves detailed information about a specific JIRA issue',
      {
        issueKey: issueKeySchema
      },
      getIssueTool.handler.bind(getIssueTool)
    );
    
    // Tool for creating a task from a Jira issue
    server.tool(
      'jira_create_task',
      'Creates a local task from a JIRA issue',
      {
        issueKey: issueKeySchema
      },
      createTaskTool.handler.bind(createTaskTool)
    );

    logger.info('JIRA tools registered successfully', { prefix: 'JIRA', isMcp: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(new Error(`Failed to register JIRA tools: ${errorMessage}`), { 
      prefix: 'JIRA', 
      isMcp: true 
    });
    throw error;
  }
} 