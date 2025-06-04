/**
 * Worklog Tools Configuration
 *
 * Defines configuration for all worklog-related JIRA tools
 */

import type { ToolConfig, ToolHandler } from "../types";
import {
  addWorklogParamsSchema,
  deleteWorklogParamsSchema,
  getWorklogsParamsSchema,
  updateWorklogParamsSchema,
} from "../../issues";

/**
 * Worklog tools configuration factory
 * 
 * Creates tool configurations for all worklog-related tools
 */
export function createWorklogToolsConfig(tools: {
  jira_add_worklog: ToolHandler;
  jira_get_worklogs: ToolHandler;
  jira_update_worklog: ToolHandler;
  jira_delete_worklog: ToolHandler;
}): ToolConfig[] {
  return [
    {
      name: "jira_add_worklog",
      description: "Add a worklog entry to track time spent on an issue",
      params: addWorklogParamsSchema.shape,
      handler: tools.jira_add_worklog.handle.bind(tools.jira_add_worklog),
    },
    {
      name: "jira_get_worklogs",
      description: "Get all worklog entries for a specific issue",
      params: getWorklogsParamsSchema.shape,
      handler: tools.jira_get_worklogs.handle.bind(tools.jira_get_worklogs),
    },
    {
      name: "jira_update_worklog",
      description: "Update an existing worklog entry",
      params: updateWorklogParamsSchema.shape,
      handler: tools.jira_update_worklog.handle.bind(tools.jira_update_worklog),
    },
    {
      name: "jira_delete_worklog",
      description: "Delete a worklog entry from an issue",
      params: deleteWorklogParamsSchema.shape,
      handler: tools.jira_delete_worklog.handle.bind(tools.jira_delete_worklog),
    },
  ];
} 