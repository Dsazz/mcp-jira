/**
 * Repository Layer Exports
 *
 * All repositories extracted from JiraClient god object
 * Each repository has a clear, specific domain responsibility
 * Consistent Repository pattern for all data access operations
 */

// Core Issue Repository - handles issue CRUD operations
export type { IssueRepository } from "./issue.repository";
export { IssueRepositoryImpl } from "./issue.repository";

// Issue Search Repository - handles JQL queries and issue searching
export type { IssueSearchRepository } from "./issue-search.repository";
export { IssueSearchRepositoryImpl } from "./issue-search.repository";

// Issue Comment Repository - handles comment operations
export type { IssueCommentRepository } from "./issue-comment.repository";
export { IssueCommentRepositoryImpl } from "./issue-comment.repository";

// Issue Transition Repository - handles status transitions and workflow
export type { IssueTransitionRepository } from "./issue-transition.repository";
export { IssueTransitionRepositoryImpl } from "./issue-transition.repository";

// Worklog Repository - handles time tracking and worklog entries
export type { WorklogRepository } from "./worklog.repository";
export { WorklogRepositoryImpl } from "./worklog.repository";

// Project Repository - handles project operations and search
export type { ProjectRepository } from "./project.repository";
export { ProjectRepositoryImpl } from "./project.repository";

// Board Repository - handles board data and configuration
export type { BoardRepository } from "./board.repository";
export { BoardRepositoryImpl } from "./board.repository";

// Sprint Repository - handles sprint data and reports
export type { SprintRepository } from "./sprint.repository";
export { SprintRepositoryImpl } from "./sprint.repository";

// User Profile Repository - handles user information and authentication context
export type { UserProfileRepository } from "./user-profile.repository";
export { UserProfileRepositoryImpl } from "./user-profile.repository";
