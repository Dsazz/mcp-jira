/**
 * Validators Layer Exports
 *
 * Validation components extracted from JiraClient god object
 * Each validator has a clear, specific validation responsibility
 */

// Project Validator - handles project existence and issue type validation
export type { ProjectValidator, IssueType } from "./project.validator";
export { ProjectValidatorImpl } from "./project.validator";

// Project Permission Checker - handles permission verification
export type { ProjectPermissionChecker } from "./project-permission.checker";
export { ProjectPermissionCheckerImpl } from "./project-permission.checker";

// Board Validator - handles board parameter validation
export type { BoardValidator } from "./board.validator";
export { BoardValidatorImpl } from "./board.validator";

// Export board schemas from board.validator
export {
  getBoardsParamsSchema,
  getBoardParamsSchema,
  type GetBoardsParams,
  type GetBoardParams,
} from "./board.validator";

// Sprint Validator - handles sprint parameter validation
export type { SprintValidator } from "./sprint.validator";
export { SprintValidatorImpl } from "./sprint.validator";

// Export sprint schemas from sprint.validator
export {
  getSprintsParamsSchema,
  getSprintParamsSchema,
  type GetSprintsParams,
  type GetSprintParams,
} from "./sprint.validator";

// Worklog Validator - handles worklog parameter validation
export type { WorklogValidator } from "./worklog.validator";
export { WorklogValidatorImpl } from "./worklog.validator";

// Export worklog schemas from worklog.validator
export {
  addWorklogParamsSchema,
  updateWorklogParamsSchema,
  deleteWorklogParamsSchema,
  getWorklogsParamsSchema,
  type AddWorklogParams,
  type UpdateWorklogParams,
  type DeleteWorklogParams,
  type GetWorklogsParams,
} from "./worklog.validator";

// Issue Comment Validator - handles issue comment parameter validation
export type { IssueCommentValidator } from "./issue-comment.validator";
export { IssueCommentValidatorImpl } from "./issue-comment.validator";

// Export issue comment schemas from issue-comment.validator
export {
  getIssueCommentsSchema,
  type GetIssueCommentsParams,
} from "./issue-comment.validator";

// Project Params Validator - handles project params validation
export type { ProjectParamsValidator } from "./project-params.validator";
export { ProjectParamsValidatorImpl } from "./project-params.validator";

// Export project schemas from project-params.validator
export {
  getProjectsParamsSchema,
  getProjectParamsSchema,
  type GetProjectsParams,
  type GetProjectParams,
} from "./project-params.validator";

// Issue Params Validator - handles issue params validation
export type {
  IssueParamsValidator,
  GetIssueParams,
} from "./issue-params.validator";
export {
  IssueParamsValidatorImpl,
  issueKeySchema,
  issueFieldsSchema,
  type JiraIssue,
  type JiraIssueList,
} from "./issue-params.validator";
