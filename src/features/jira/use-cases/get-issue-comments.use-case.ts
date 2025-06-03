/**
 * Get Issue Comments Use Case
 *
 * Business logic for retrieving JIRA issue comments with filtering capabilities
 */

import type { Comment } from "@features/jira/repositories/comment.models";
import type { IssueCommentRepository } from "@features/jira/repositories/issue-comment.repository";
import { JiraApiError } from "@features/jira/client/errors";

/**
 * Request parameters for get issue comments use case
 */
export interface GetIssueCommentsUseCaseRequest {
  issueKey: string;
  maxComments?: number;
  includeInternal?: boolean;
  orderBy?: "created" | "updated";
  authorFilter?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * Interface for get issue comments use case
 */
export interface GetIssueCommentsUseCase {
  /**
   * Execute the get issue comments use case
   *
   * @param request - Comments retrieval parameters
   * @returns List of JIRA comments matching the criteria
   */
  execute(request: GetIssueCommentsUseCaseRequest): Promise<Comment[]>;
}

/**
 * Implementation of the get issue comments use case
 */
export class GetIssueCommentsUseCaseImpl implements GetIssueCommentsUseCase {
  /**
   * Create a new GetIssueCommentsUseCase implementation
   *
   * @param issueCommentRepository - Repository for issue comment operations
   */
  constructor(
    private readonly issueCommentRepository: IssueCommentRepository,
  ) {}

  /**
   * Execute the get issue comments use case
   *
   * @param request - Comments retrieval parameters
   * @returns List of JIRA comments matching the criteria
   */
  public async execute(
    request: GetIssueCommentsUseCaseRequest,
  ): Promise<Comment[]> {
    try {
      // Build API options from request parameters
      const apiOptions = {
        maxComments: request.maxComments,
        orderBy: request.orderBy,
        expand: ["renderedBody"], // Always expand rendered body for better parsing
      };

      // Get all comments from repository
      const allComments = await this.issueCommentRepository.getIssueComments(
        request.issueKey,
        apiOptions,
      );

      // Apply client-side filtering for advanced parameters
      return this.applyAdvancedFiltering(allComments, request);
    } catch (error) {
      // Rethrow with better context
      // TODO: Add specific error types
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(
          `Failed to get issue comments: ${error.message}`,
          400
        );
      }
      throw error;
    }
  }

  /**
   * Apply advanced filtering options to comments
   * Handles client-side filtering for parameters not supported by JIRA API
   */
  private applyAdvancedFiltering(
    comments: Comment[],
    request: GetIssueCommentsUseCaseRequest,
  ): Comment[] {
    let filtered = [...comments];

    // Filter by author if specified
    if (request.authorFilter) {
      const authorFilter = request.authorFilter.toLowerCase();
      filtered = filtered.filter(
        (comment) =>
          comment.author?.displayName?.toLowerCase().includes(authorFilter) ||
          comment.author?.emailAddress?.toLowerCase().includes(authorFilter),
      );
    }

    // Filter by date range if specified
    if (request.dateRange) {
      filtered = filtered.filter((comment) => {
        const commentDate = new Date(comment.created);

        if (request.dateRange?.from) {
          const fromDate = new Date(request.dateRange.from);
          if (commentDate < fromDate) return false;
        }

        if (request.dateRange?.to) {
          const toDate = new Date(request.dateRange.to);
          if (commentDate > toDate) return false;
        }

        return true;
      });
    }

    // Filter internal comments if not requested
    if (!request.includeInternal) {
      filtered = filtered.filter((comment) => {
        // Include comment if it's public (no visibility restrictions and jsdPublic is not false)
        return !comment.visibility && comment.jsdPublic !== false;
      });
    }

    // Apply maxComments limit to final filtered results
    if (request.maxComments && filtered.length > request.maxComments) {
      filtered = filtered.slice(0, request.maxComments);
    }

    return filtered;
  }
}
