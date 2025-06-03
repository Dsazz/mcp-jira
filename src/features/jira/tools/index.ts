/**
 * JIRA Tools Factory
 *
 * Creates and configures all JIRA MCP tools with proper dependency injection
 */

import type {
  BoardRepository,
  IssueCommentRepository,
  IssueRepository,
  IssueSearchRepository,
  IssueTransitionRepository,
  ProjectRepository,
  SprintRepository,
  UserProfileRepository,
  WorklogRepository,
} from "../repositories";

// Import use case types
import type {
  CreateIssueUseCase,
  GetAssignedIssuesUseCase,
  GetBoardsUseCase,
  GetIssueCommentsUseCase,
  GetIssueUseCase,
  GetProjectsUseCase,
  GetSprintsUseCase,
  SearchIssuesUseCase,
  UpdateIssueUseCase,
} from "../use-cases";

// Import validator types
import type {
  BoardValidator,
  IssueCommentValidator,
  IssueParamsValidator,
  ProjectParamsValidator,
  SprintValidator,
} from "../validators";

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
 * Dependencies required for JIRA tools
 */
export interface JiraToolDependencies {
  // Repositories
  issueRepository: IssueRepository;
  issueSearchRepository: IssueSearchRepository;
  issueCommentRepository: IssueCommentRepository;
  issueTransitionRepository: IssueTransitionRepository;
  worklogRepository: WorklogRepository;
  projectRepository: ProjectRepository;
  boardRepository: BoardRepository;
  sprintRepository: SprintRepository;
  userProfileRepository: UserProfileRepository;

  // Use cases
  createIssueUseCase: CreateIssueUseCase;
  updateIssueUseCase: UpdateIssueUseCase;
  searchIssuesUseCase: SearchIssuesUseCase;
  getBoardsUseCase: GetBoardsUseCase;
  getSprintsUseCase: GetSprintsUseCase;
  getIssueCommentsUseCase: GetIssueCommentsUseCase;
  getProjectsUseCase: GetProjectsUseCase;
  getAssignedIssuesUseCase: GetAssignedIssuesUseCase;
  getIssueUseCase: GetIssueUseCase;

  // Validators
  boardValidator: BoardValidator;
  sprintValidator: SprintValidator;
  issueCommentValidator: IssueCommentValidator;
  projectParamsValidator: ProjectParamsValidator;
  issueParamsValidator: IssueParamsValidator;
}

/**
 * Return type for JIRA tools factory
 */
export interface JiraTools {
  jira_get_issue: GetIssueHandler;
  jira_get_issue_comments: GetIssueCommentsHandler;
  jira_get_assigned_issues: GetAssignedIssuesHandler;
  jira_create_issue: CreateIssueHandler;
  jira_update_issue: UpdateIssueHandler;
  jira_search_issues: SearchIssuesHandler;
  jira_get_projects: GetProjectsHandler;
  jira_get_boards: GetBoardsHandler;
  jira_get_sprints: GetSprintsHandler;
}

/**
 * Create all JIRA MCP tools with dependency injection
 */
export function createJiraTools(dependencies: JiraToolDependencies): JiraTools {
  return {
    // Core issue operations
    jira_get_issue: new GetIssueHandler(
      dependencies.getIssueUseCase,
      dependencies.issueParamsValidator,
    ),
    jira_get_issue_comments: new GetIssueCommentsHandler(
      dependencies.getIssueCommentsUseCase,
      dependencies.issueCommentValidator,
    ),
    jira_get_assigned_issues: new GetAssignedIssuesHandler(
      dependencies.getAssignedIssuesUseCase,
    ),
    jira_create_issue: new CreateIssueHandler(dependencies.createIssueUseCase),
    jira_update_issue: new UpdateIssueHandler(dependencies.updateIssueUseCase),
    jira_search_issues: new SearchIssuesHandler(
      dependencies.searchIssuesUseCase,
    ),

    // Project operations
    jira_get_projects: new GetProjectsHandler(
      dependencies.getProjectsUseCase,
      dependencies.projectParamsValidator,
    ),

    // Board operations
    jira_get_boards: new GetBoardsHandler(
      dependencies.getBoardsUseCase,
      dependencies.boardValidator,
    ),

    // Sprint operations
    jira_get_sprints: new GetSprintsHandler(
      dependencies.getSprintsUseCase,
      dependencies.sprintValidator,
    ),
  };
}
