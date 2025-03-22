/**
 * Registers JIRA tools with MCP server
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetAssignedIssuesTool } from './tools/get-assigned-issues/get-assigned-issues.tool';
import { GetIssueTool } from './tools/get-issue/get-issue.tool';
import { CreateTaskTool } from './tools/create-task/create-task.tool';
import { issueKeySchema } from './validation/common-schemas';
import { getLogger } from '../../shared/logging';
import { JiraConfig } from './config/jira-config';

/**
 * Registers all JIRA tools with the MCP server
 * @param server - The MCP server instance
 * @param config - The JIRA configuration
 */
export function registerTools(server: McpServer, config: JiraConfig): void {
  const jiraLogger = getLogger('JIRA');
  
  try {
    // Initialize tools with shared config
    const getAssignedIssuesTool = new GetAssignedIssuesTool(config);
    const getIssueTool = new GetIssueTool(config);
    const createTaskTool = new CreateTaskTool(config);

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

    jiraLogger.info('JIRA tools registered successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    jiraLogger.error(`Failed to register JIRA tools: ${errorMessage}`);
    throw error;
  }
} 