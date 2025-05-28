/**
 * Register JIRA tools with MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLogger } from "@core/logging";
import { adaptHandler } from "@core/responses";
import type { ToolConfig } from "@core/tools";
import { JiraClient } from "./api/jira.client.impl";
import { JiraConfig } from "./api/jira.config.types";
import { createJiraTools } from "./tools";
import { issueKeySchema, searchJiraIssuesBaseSchema, getIssueCommentsSchema } from "./tools/utils/schemas";

// Logger instance
const logger = getLogger("jira");

/**
 * Register tools with MCP server
 *
 * @param server - The MCP server instance
 */
export function registerTools(server: McpServer): void {
  try {
    // Create configuration from environment variables
    const jiraConfig = JiraConfig.fromEnv();

    // Create JIRA client (which will validate the config internally)
    const client = new JiraClient(jiraConfig);

    // Create tool instances
    const jiraTools = createJiraTools(client);

    // Define tool configurations
    const toolConfigs: ToolConfig[] = [
      {
        name: "jira_get_issue",
        description:
          "Retrieves detailed information about a specific JIRA issue",
        params: { issueKey: issueKeySchema },
        handler: (args: unknown) => jiraTools.getIssue.handle(args),
      },
      {
        name: "jira_get_issue_comments",
        description:
          "Retrieves comments for a specific JIRA issue with configurable quantity and filtering options",
        params: getIssueCommentsSchema.shape,
        handler: (args: unknown) => jiraTools.getIssueComments.handle(args),
      },
      {
        name: "jira_get_assigned_issues",
        description: "Retrieves all JIRA issues assigned to the current user",
        params: {},
        handler: (args: unknown) => jiraTools.getAssignedIssues.handle(args),
      },
      {
        name: "jira_create_task",
        description: "Creates a local task from a JIRA issue",
        params: { issueKey: issueKeySchema },
        handler: (args: unknown) => jiraTools.createTask.handle(args),
      },
      {
        name: "search_jira_issues",
        description: "Search JIRA issues using JQL queries or helper parameters. Supports both expert JQL and beginner-friendly filters.",
        params: searchJiraIssuesBaseSchema.shape,
        handler: (args: unknown) => jiraTools.searchIssues.handle(args),
      },
    ];

    // Register all tools with MCP server
    for (const config of toolConfigs) {
      server.tool(
        config.name,
        config.description,
        config.params,
        adaptHandler(config.handler),
      );
      logger.debug(`Registered tool: ${config.name}`);
    }

    logger.info("JIRA tools registered successfully");
  } catch (error) {
    logger.error(`Failed to register JIRA tools: ${error}`);
    throw error;
  }
}
