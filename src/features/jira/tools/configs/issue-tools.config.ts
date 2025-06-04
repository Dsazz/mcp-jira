/**
 * Issue Tools Configuration
 *
 * Defines configuration for all issue-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "@core/tools";
import {
  createIssueParamsSchema,
  getIssueCommentsSchema,
  issueKeySchema,
  searchJiraIssuesBaseSchema,
  updateIssueParamsSchema,
} from "../../issues";

/**
 * Issue tools configuration factory
 * 
 * Creates tool configurations for all issue-related tools
 */
export function createIssueToolsConfig(tools: {
  jira_get_issue: ToolHandler;
  jira_get_issue_comments: ToolHandler;
  jira_get_assigned_issues: ToolHandler;
  jira_create_issue: ToolHandler;
  jira_update_issue: ToolHandler;
  jira_search_issues: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_get_issue",
      description: "Retrieves detailed information about a specific JIRA issue",
      params: { issueKey: issueKeySchema },
      handler: tools.jira_get_issue.handle.bind(tools.jira_get_issue),
    },
    {
      name: "jira_get_issue_comments",
      description: "Retrieves comments for a specific JIRA issue with configurable quantity and filtering options",
      params: getIssueCommentsSchema.shape,
      handler: tools.jira_get_issue_comments.handle.bind(tools.jira_get_issue_comments),
    },
    {
      name: "jira_get_assigned_issues",
      description: "Retrieves all JIRA issues assigned to the current user",
      params: {},
      handler: tools.jira_get_assigned_issues.handle.bind(tools.jira_get_assigned_issues),
    },
    {
      name: "jira_create_issue",
      description: "Creates a new JIRA issue with specified parameters",
      params: createIssueParamsSchema.shape,
      handler: tools.jira_create_issue.handle.bind(tools.jira_create_issue),
    },
    {
      name: "jira_update_issue",
      description: "Updates an existing JIRA issue with field changes, status transitions, and worklog entries",
      params: updateIssueParamsSchema.shape,
      handler: tools.jira_update_issue.handle.bind(tools.jira_update_issue),
    },
    {
      name: "search_jira_issues",
      description: "Search JIRA issues using JQL queries or helper parameters. Supports both expert JQL and beginner-friendly filters.",
      params: searchJiraIssuesBaseSchema.shape,
      handler: tools.jira_search_issues.handle.bind(tools.jira_search_issues),
    },
  ];
} 