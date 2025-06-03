/**
 * Use Cases Layer Exports
 *
 * Business logic use cases extracted from JiraClient god object
 * Each use case encapsulates complex business operations with validation
 */

// Create Issue Use Case - handles issue creation with comprehensive validation
export type {
  CreateIssueUseCase,
  CreateIssueUseCaseRequest,
} from "./create-issue.use-case";
export {
  CreateIssueUseCaseImpl,
  createIssueParamsSchema,
  transformToCreateRequest,
  type CreateIssueParams,
  type CreateIssueRequest,
} from "./create-issue.use-case";

// Update Issue Use Case - handles issue updates with validation and transitions
export type {
  UpdateIssueUseCase,
  UpdateIssueUseCaseRequest,
} from "./update-issue.use-case";
export {
  UpdateIssueUseCaseImpl,
  updateIssueParamsSchema,
  transitionIssueParamsSchema,
  type UpdateIssueParams,
  type TransitionIssueParams,
} from "./update-issue.use-case";

// Search Issues Use Case - handles issue searching with JQL query building
export type {
  SearchIssuesUseCase,
  SearchIssuesUseCaseRequest,
} from "./search-issues.use-case";
export {
  SearchIssuesUseCaseImpl,
  searchJiraIssuesBaseSchema,
  searchJiraIssuesSchema,
  buildJQLFromHelpers,
  type SearchJiraIssuesParams,
} from "./search-issues.use-case";

// Get Boards Use Case - handles board retrieval with filtering
export type {
  GetBoardsUseCase,
  GetBoardsUseCaseRequest,
} from "./get-boards.use-case";
export { GetBoardsUseCaseImpl } from "./get-boards.use-case";

// Get Sprints Use Case - handles sprint retrieval with filtering
export type {
  GetSprintsUseCase,
  GetSprintsUseCaseRequest,
} from "./get-sprints.use-case";
export { GetSprintsUseCaseImpl } from "./get-sprints.use-case";

// Get Issue Comments Use Case - handles issue comment retrieval with filtering
export type {
  GetIssueCommentsUseCase,
  GetIssueCommentsUseCaseRequest,
} from "./get-issue-comments.use-case";
export { GetIssueCommentsUseCaseImpl } from "./get-issue-comments.use-case";

// Get Projects Use Case - handles project retrieval with filtering
export type {
  GetProjectsUseCase,
  GetProjectsUseCaseRequest,
} from "./get-projects.use-case";
export { GetProjectsUseCaseImpl } from "./get-projects.use-case";

// Get Assigned Issues Use Case - handles retrieval of issues assigned to current user
export type {
  GetAssignedIssuesUseCase,
  GetAssignedIssuesUseCaseRequest,
} from "./get-assigned-issues.use-case";
export { GetAssignedIssuesUseCaseImpl } from "./get-assigned-issues.use-case";

// Get Issue Use Case - handles retrieval of specific issue details
export type {
  GetIssueUseCase,
  GetIssueUseCaseRequest,
} from "./get-issue.use-case";
export { GetIssueUseCaseImpl } from "./get-issue.use-case";
