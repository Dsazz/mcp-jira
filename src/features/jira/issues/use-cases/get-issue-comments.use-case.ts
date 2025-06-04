/**
 * Get Issue Comments Use Case
 */

import type { Comment, GetCommentsOptions } from "../models/comment.models";
import type { IssueCommentRepository } from "../repositories";
import type {
  GetIssueCommentsParams,
  IssueCommentValidator,
} from "../validators";

export interface GetIssueCommentsUseCase {
  execute(params: GetIssueCommentsParams): Promise<Comment[]>;
}

export class GetIssueCommentsUseCaseImpl implements GetIssueCommentsUseCase {
  constructor(
    private readonly commentRepository: IssueCommentRepository,
    private readonly validator: IssueCommentValidator,
  ) {}

  async execute(params: GetIssueCommentsParams): Promise<Comment[]> {
    const validatedParams = this.validator.validateGetCommentsParams(params);
    // Convert to repository format
    const options = {
      issueKey: validatedParams.issueKey,
      maxResults: validatedParams.maxComments,
      startAt: 0,
      orderBy: validatedParams.orderBy,
    } as GetCommentsOptions;
    return this.commentRepository.getIssueComments(
      validatedParams.issueKey,
      options,
    );
  }
}
