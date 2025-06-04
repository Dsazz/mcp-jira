/**
 * JIRA Tools Interface
 *
 * Defines the complete interface for all available JIRA MCP tools
 */

import type { ToolHandler } from "@core/tools";

/**
 * Interface for JIRA tool handlers
 *
 * Defines all available JIRA tools with their respective handlers
 */
export interface JiraTools {
  // Issue management tools
  jira_get_issue: ToolHandler;
  jira_get_issue_comments: ToolHandler;
  jira_get_assigned_issues: ToolHandler;
  jira_create_issue: ToolHandler;
  jira_update_issue: ToolHandler;
  jira_search_issues: ToolHandler;

  // Project management tools
  jira_get_projects: ToolHandler;

  // Board management tools
  jira_get_boards: ToolHandler;

  // Sprint management tools
  jira_get_sprints: ToolHandler;

  // Worklog management tools
  jira_add_worklog: ToolHandler;
  jira_get_worklogs: ToolHandler;
  jira_update_worklog: ToolHandler;
  jira_delete_worklog: ToolHandler;

  // User management tools
  jira_get_current_user: ToolHandler;
}

/**
 * JIRA tool categories
 *
 * Categorizes tools by their functional domain
 */
export interface JiraToolCategories {
  /** Issue-related tools */
  issues: Pick<
    JiraTools,
    | "jira_get_issue"
    | "jira_get_issue_comments"
    | "jira_get_assigned_issues"
    | "jira_create_issue"
    | "jira_update_issue"
    | "jira_search_issues"
  >;

  /** Project-related tools */
  projects: Pick<JiraTools, "jira_get_projects">;

  /** Board-related tools */
  boards: Pick<JiraTools, "jira_get_boards">;

  /** Sprint-related tools */
  sprints: Pick<JiraTools, "jira_get_sprints">;

  /** Worklog-related tools */
  worklogs: Pick<
    JiraTools,
    | "jira_add_worklog"
    | "jira_get_worklogs"
    | "jira_update_worklog"
    | "jira_delete_worklog"
  >;

  /** User-related tools */
  users: Pick<JiraTools, "jira_get_current_user">;
}

/**
 * Tool names by category
 *
 * Provides string literal types for tool names organized by category
 */
export const JIRA_TOOL_NAMES = {
  ISSUES: [
    "jira_get_issue",
    "jira_get_issue_comments",
    "jira_get_assigned_issues",
    "jira_create_issue",
    "jira_update_issue",
    "jira_search_issues",
  ] as const,

  PROJECTS: ["jira_get_projects"] as const,

  BOARDS: ["jira_get_boards"] as const,

  SPRINTS: ["jira_get_sprints"] as const,

  WORKLOGS: [
    "jira_add_worklog",
    "jira_get_worklogs",
    "jira_update_worklog",
    "jira_delete_worklog",
  ] as const,

  USERS: ["jira_get_current_user"] as const,
} as const;

/**
 * All JIRA tool names as a union type
 */
export type JiraToolName = keyof JiraTools;
