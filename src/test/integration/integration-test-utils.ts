/**
 * Integration test utilities
 */
import { JiraHttpClientImpl } from "@features/jira/client/http/jira-http-client";
import { BoardRepositoryImpl } from "@features/jira/boards/repositories/board.repository";
import { IssueCommentRepositoryImpl } from "@features/jira/issues/repositories/issue-comment.repository";
import { IssueRepositoryImpl } from "@features/jira/issues/repositories/issue.repository";
import { IssueSearchRepositoryImpl } from "@features/jira/issues/repositories/issue-search.repository";
import { ProjectRepositoryImpl } from "@features/jira/projects/repositories/project.repository";
import { SprintRepositoryImpl } from "@features/jira/sprints/repositories/sprint.repository";
import { UserProfileRepositoryImpl } from "@features/jira/users/repositories/user-profile.repository";
import { WorklogRepositoryImpl } from "@features/jira/issues/repositories/worklog.repository";

/**
 * Creates a new JiraHttpClient for testing
 */
export function createJiraHttpClient() {
  return new JiraHttpClientImpl({
    baseUrl: "https://your-domain.atlassian.net",
    auth: {
      username: "test@example.com",
      apiToken: "test-token",
    },
  });
}

/**
 * Creates repository implementations for testing
 */
export function createRepositories() {
  const client = createJiraHttpClient();
  
  return {
    boardRepository: new BoardRepositoryImpl(client),
    issueRepository: new IssueRepositoryImpl(client),
    issueSearchRepository: new IssueSearchRepositoryImpl(client),
    issueCommentRepository: new IssueCommentRepositoryImpl(client),
    projectRepository: new ProjectRepositoryImpl(client),
    sprintRepository: new SprintRepositoryImpl(client),
    userProfileRepository: new UserProfileRepositoryImpl(client),
    worklogRepository: new WorklogRepositoryImpl(client),
  };
}
