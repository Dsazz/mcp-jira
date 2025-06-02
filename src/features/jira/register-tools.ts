import { getLogger } from "@core/logging";
import { adaptHandler } from "@core/responses";
import type { ToolConfig } from "@core/tools";
import {
  getIssueCommentsSchema,
  issueKeySchema,
  searchJiraIssuesBaseSchema,
} from "@features/jira/api";
/**
 * Register JIRA tools with MCP
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { JiraClient } from "./api/jira.client.impl";
import { JiraConfig } from "./api/jira.config.types";
import {
  createIssueParamsSchema,
  getBoardsParamsSchema,
  getProjectsParamsSchema,
  getSprintsParamsSchema,
  updateIssueParamsSchema,
} from "./api/jira.schemas";
import { createJiraTools } from "./tools";

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
        name: "jira_create_issue",
        description: "Creates a new JIRA issue with specified parameters",
        params: createIssueParamsSchema.shape,
        handler: (args: unknown) => jiraTools.createIssue.handle(args),
      },
      {
        name: "jira_update_issue",
        description:
          "Updates an existing JIRA issue with field changes, status transitions, and worklog entries",
        params: updateIssueParamsSchema.shape,
        handler: (args: unknown) => jiraTools.updateIssue.handle(args),
      },
      {
        name: "search_jira_issues",
        description:
          "Search JIRA issues using JQL queries or helper parameters. Supports both expert JQL and beginner-friendly filters.",
        params: searchJiraIssuesBaseSchema.shape,
        handler: (args: unknown) => jiraTools.searchIssues.handle(args),
      },
      {
        name: "jira_get_projects",
        description:
          "Get all accessible JIRA projects with filtering and search capabilities",
        params: getProjectsParamsSchema.shape,
        handler: (args: unknown) => jiraTools.getProjects.handle(args),
      },
      {
        name: "jira_get_boards",
        description:
          "Get all accessible JIRA boards with filtering by type, project, and name",
        params: getBoardsParamsSchema.shape,
        handler: (args: unknown) => jiraTools.getBoards.handle(args),
      },
      {
        name: "jira_get_sprints",
        description:
          "Get all sprints for a specific JIRA board with filtering by state",
        params: getSprintsParamsSchema.shape,
        handler: (args: unknown) => jiraTools.getSprints.handle(args),
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
