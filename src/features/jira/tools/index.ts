/**
 * JIRA Tools Module
 */

import type { JiraClient } from "../api/jira.client.impl";
import { CreateTaskHandler } from "./handlers/create-task.handler";
import { GetAssignedIssuesHandler } from "./handlers/get-assigned-issues.handler";
import { GetIssueHandler } from "./handlers/get-issue.handler";
import { GetIssueCommentsHandler } from "./handlers/get-issue-comments.handler";
import { SearchIssuesHandler } from "./handlers/search-issues.handler";

/**
 * Factory function to create all JIRA tool handlers
 *
 * @param client - JIRA API client to use for handlers
 * @returns Object containing all JIRA tool handlers
 */
export function createJiraTools(client: JiraClient) {
  return {
    getIssue: new GetIssueHandler(client),
    getIssueComments: new GetIssueCommentsHandler(client),
    getAssignedIssues: new GetAssignedIssuesHandler(client),
    createTask: new CreateTaskHandler(client),
    searchIssues: new SearchIssuesHandler(client),
  };
}
