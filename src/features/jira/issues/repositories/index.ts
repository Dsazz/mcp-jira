/**
 * Issue repositories exports
 */

import type { Comment, GetCommentsOptions } from "../models/comment.models";
import { IssueSearchRepositoryImpl } from "./issue-search.repository";

export interface IssueCommentRepository {
  getComments(options: GetCommentsOptions): Promise<Comment[]>;
}

export { IssueSearchRepositoryImpl };
export type { IssueSearchRepository } from "./issue-search.repository";
