/**
 * JIRA Tools
 *
 * Main exports for JIRA MCP tools
 */
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { CreateIssueHandler } from "./handlers/create-issue.handler";
import { GetAssignedIssuesHandler } from "./handlers/get-assigned-issues.handler";
import { GetBoardsHandler } from "./handlers/get-boards.handler";
import { GetIssueCommentsHandler } from "./handlers/get-issue-comments.handler";
import { GetIssueHandler } from "./handlers/get-issue.handler";
import { GetProjectsHandler } from "./handlers/get-projects.handler";
import { GetSprintsHandler } from "./handlers/get-sprints.handler";
import { SearchIssuesHandler } from "./handlers/search-issues.handler";
import { UpdateIssueHandler } from "./handlers/update-issue.handler";

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
    createIssue: new CreateIssueHandler(client),
    updateIssue: new UpdateIssueHandler(client),
    searchIssues: new SearchIssuesHandler(client),
    getProjects: new GetProjectsHandler(client),
    getBoards: new GetBoardsHandler(client),
    getSprints: new GetSprintsHandler(client),
  };
}
