/**
 * Get Issue Comments Use Case
 */

import type { IssueCommentRepository } from "../repositories";
import type { Comment, GetCommentsOptions } from "../models/comment.models";
import type { IssueCommentValidator } from "../validators";

export interface GetIssueCommentsUseCase {
  execute(options: GetCommentsOptions): Promise<Comment[]>;
}

export class GetIssueCommentsUseCaseImpl implements GetIssueCommentsUseCase {
  constructor(
    private readonly commentRepository: IssueCommentRepository,
    private readonly validator: IssueCommentValidator
  ) {}

  async execute(options: GetCommentsOptions): Promise<Comment[]> {
    this.validator.validateGetComments(options);
    return this.commentRepository.getComments(options);
  }
}
