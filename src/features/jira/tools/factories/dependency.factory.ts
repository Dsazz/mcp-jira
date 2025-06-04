/**
 * Dependency Factory
 *
 * Creates and manages all dependencies for JIRA tools
 */

import type { JiraConfig } from "../../client/config";
import { JiraHttpClient } from "../../client/http/jira.http-client.impl";

// Import repositories
import {
  IssueCommentRepositoryImpl,
  IssueRepositoryImpl,
  IssueSearchRepositoryImpl,
  IssueTransitionRepositoryImpl,
  WorklogRepositoryImpl,
} from "../../issues";

import {
  ProjectPermissionRepositoryImpl,
  ProjectRepositoryImpl,
} from "../../projects";

import { BoardRepositoryImpl } from "../../boards";
import { SprintRepositoryImpl } from "../../sprints";
import { UserProfileRepositoryImpl } from "../../users";

// Import validators
import {
  IssueCommentValidatorImpl,
  IssueParamsValidatorImpl,
  WorklogValidatorImpl,
} from "../../issues";

import {
  ProjectParamsValidatorImpl,
  ProjectValidatorImpl,
} from "../../projects";

import { BoardValidatorImpl } from "../../boards";
import { SprintValidatorImpl } from "../../sprints";
import { UserProfileValidatorImpl } from "../../users";

// Import use cases
import {
  AddWorklogUseCaseImpl,
  CreateIssueUseCaseImpl,
  DeleteWorklogUseCaseImpl,
  GetAssignedIssuesUseCaseImpl,
  GetIssueCommentsUseCaseImpl,
  GetIssueUseCaseImpl,
  GetWorklogsUseCaseImpl,
  SearchIssuesUseCaseImpl,
  UpdateIssueUseCaseImpl,
  UpdateWorklogUseCaseImpl,
} from "../../issues";

import { GetBoardsUseCaseImpl } from "../../boards";
import { GetProjectsUseCaseImpl } from "../../projects";
import { GetSprintsUseCaseImpl } from "../../sprints";
import { GetCurrentUserUseCaseImpl } from "../../users";

/**
 * Dependencies interface
 *
 * Defines all dependencies required for JIRA tools
 */
export interface JiraDependencies {
  // Use cases
  createIssueUseCase: CreateIssueUseCaseImpl;
  updateIssueUseCase: UpdateIssueUseCaseImpl;
  searchIssuesUseCase: SearchIssuesUseCaseImpl;
  getIssueUseCase: GetIssueUseCaseImpl;
  getAssignedIssuesUseCase: GetAssignedIssuesUseCaseImpl;
  getIssueCommentsUseCase: GetIssueCommentsUseCaseImpl;
  addWorklogUseCase: AddWorklogUseCaseImpl;
  getWorklogsUseCase: GetWorklogsUseCaseImpl;
  updateWorklogUseCase: UpdateWorklogUseCaseImpl;
  deleteWorklogUseCase: DeleteWorklogUseCaseImpl;
  getProjectsUseCase: GetProjectsUseCaseImpl;
  getBoardsUseCase: GetBoardsUseCaseImpl;
  getSprintsUseCase: GetSprintsUseCaseImpl;
  getCurrentUserUseCase: GetCurrentUserUseCaseImpl;

  // Validators
  issueParamsValidator: IssueParamsValidatorImpl;
  issueCommentValidator: IssueCommentValidatorImpl;
  worklogValidator: WorklogValidatorImpl;
  projectParamsValidator: ProjectParamsValidatorImpl;
  boardValidator: BoardValidatorImpl;
  sprintValidator: SprintValidatorImpl;
  userProfileValidator: UserProfileValidatorImpl;
}

/**
 * Create all JIRA dependencies
 *
 * @param config - JIRA configuration
 * @returns Complete set of dependencies for JIRA tools
 */
export function createJiraDependencies(config: JiraConfig): JiraDependencies {
  // Create shared HTTP client
  const httpClient = new JiraHttpClient(config);

  // Create repositories
  const repositories = createRepositories(httpClient);

  // Create validators
  const validators = createValidators(httpClient);

  // Create use cases
  const useCases = createUseCases(repositories, validators);

  return {
    ...useCases,
    ...validators,
  };
}

/**
 * Create all repositories
 */
function createRepositories(httpClient: JiraHttpClient) {
  return {
    issueRepository: new IssueRepositoryImpl(httpClient),
    issueSearchRepository: new IssueSearchRepositoryImpl(httpClient),
    issueCommentRepository: new IssueCommentRepositoryImpl(httpClient),
    issueTransitionRepository: new IssueTransitionRepositoryImpl(httpClient),
    worklogRepository: new WorklogRepositoryImpl(httpClient),
    projectRepository: new ProjectRepositoryImpl(httpClient),
    projectPermissionRepository: new ProjectPermissionRepositoryImpl(
      httpClient,
    ),
    boardRepository: new BoardRepositoryImpl(httpClient),
    sprintRepository: new SprintRepositoryImpl(httpClient),
    userProfileRepository: new UserProfileRepositoryImpl(httpClient),
  };
}

/**
 * Create all validators
 */
function createValidators(httpClient: JiraHttpClient) {
  return {
    issueParamsValidator: new IssueParamsValidatorImpl(),
    issueCommentValidator: new IssueCommentValidatorImpl(),
    worklogValidator: new WorklogValidatorImpl(),
    projectValidator: new ProjectValidatorImpl(httpClient),
    projectParamsValidator: new ProjectParamsValidatorImpl(),
    boardValidator: new BoardValidatorImpl(),
    sprintValidator: new SprintValidatorImpl(),
    userProfileValidator: new UserProfileValidatorImpl(),
  };
}

/**
 * Create all use cases
 */
function createUseCases(
  repositories: ReturnType<typeof createRepositories>,
  validators: ReturnType<typeof createValidators>,
) {
  return {
    // Issue use cases
    createIssueUseCase: new CreateIssueUseCaseImpl(
      repositories.issueRepository,
      validators.projectValidator,
      repositories.projectPermissionRepository,
    ),
    updateIssueUseCase: new UpdateIssueUseCaseImpl(
      repositories.issueRepository,
      repositories.issueTransitionRepository,
      repositories.worklogRepository,
      repositories.projectPermissionRepository,
    ),
    searchIssuesUseCase: new SearchIssuesUseCaseImpl(
      repositories.issueSearchRepository,
    ),
    getIssueUseCase: new GetIssueUseCaseImpl(repositories.issueRepository),
    getAssignedIssuesUseCase: new GetAssignedIssuesUseCaseImpl(
      repositories.issueSearchRepository,
    ),
    getIssueCommentsUseCase: new GetIssueCommentsUseCaseImpl(
      repositories.issueCommentRepository,
      validators.issueCommentValidator,
    ),

    // Worklog use cases
    addWorklogUseCase: new AddWorklogUseCaseImpl(
      repositories.worklogRepository,
    ),
    getWorklogsUseCase: new GetWorklogsUseCaseImpl(
      repositories.worklogRepository,
    ),
    updateWorklogUseCase: new UpdateWorklogUseCaseImpl(
      repositories.worklogRepository,
    ),
    deleteWorklogUseCase: new DeleteWorklogUseCaseImpl(
      repositories.worklogRepository,
    ),

    // Project use cases
    getProjectsUseCase: new GetProjectsUseCaseImpl(
      repositories.projectRepository,
    ),

    // Board use cases
    getBoardsUseCase: new GetBoardsUseCaseImpl(repositories.boardRepository),

    // Sprint use cases
    getSprintsUseCase: new GetSprintsUseCaseImpl(repositories.sprintRepository),

    // User use cases
    getCurrentUserUseCase: new GetCurrentUserUseCaseImpl(
      repositories.userProfileRepository,
    ),
  };
}
