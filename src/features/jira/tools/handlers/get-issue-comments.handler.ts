/**
 * Get Issue Comments Handler
 *
 * Handles retrieving comments for a specific JIRA issue with configurable options
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import { formatZodError } from "@core/utils/validation";
import {
  type GetIssueCommentsParams,
  getIssueCommentsSchema,
} from "@features/jira/api";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import type {
  Comment,
  GetCommentsOptions,
} from "@features/jira/api/jira.models.types";
import {
  type CommentsContext,
  CommentsFormatter,
} from "@features/jira/formatters/comments.formatter";

/**
 * Handler for retrieving and formatting JIRA issue comments
 * Implements progressive disclosure approach from creative phase decisions
 */
export class GetIssueCommentsHandler extends BaseToolHandler<
  GetIssueCommentsParams,
  string
> {
  private formatter: CommentsFormatter;

  /**
   * Create a new GetIssueCommentsHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Get Issue Comments");
    this.formatter = new CommentsFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves comments for a JIRA issue and formats them using the formatter
   *
   * @param params - Parameters for comment retrieval with progressive disclosure options
   */
  protected async execute(params: GetIssueCommentsParams): Promise<string> {
    try {
      // Validate parameters
      const result = getIssueCommentsSchema.safeParse(params);
      if (!result.success) {
        const errorMessage = `Invalid comment parameters: ${formatZodError(
          result.error,
        )}`;
        throw new Error(errorMessage);
      }

      const validatedParams = result.data;
      this.logger.info(
        `Getting comments for JIRA issue: ${validatedParams.issueKey}`,
      );

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Build API options from validated parameters
      const apiOptions: GetCommentsOptions = {
        maxComments: validatedParams.maxComments,
        orderBy: validatedParams.orderBy,
        expand: ["renderedBody"], // Always expand rendered body for better parsing
      };

      // Get all comments from API (we'll filter client-side for advanced options)
      const allComments = await this.client.getIssueComments(
        validatedParams.issueKey,
        apiOptions,
      );

      // Apply client-side filtering for advanced parameters
      const filteredComments = this.applyAdvancedFiltering(
        allComments,
        validatedParams,
      );

      // Create formatting context
      const context: CommentsContext = {
        issueKey: validatedParams.issueKey,
        totalComments: allComments.length,
        maxDisplayed: filteredComments.length,
      };

      // Format the comments using the formatter
      return this.formatter.format({ comments: filteredComments, context });
    } catch (error) {
      this.logger.error(`Failed to get comments: ${error}`);
      throw error;
    }
  }

  /**
   * Apply advanced filtering options to comments
   * Handles client-side filtering for parameters not supported by JIRA API
   */
  private applyAdvancedFiltering(
    comments: Comment[],
    params: GetIssueCommentsParams,
  ): Comment[] {
    let filtered = [...comments];

    // Filter by author if specified
    if (params.authorFilter) {
      const authorFilter = params.authorFilter.toLowerCase();
      filtered = filtered.filter(
        (comment) =>
          comment.author?.displayName?.toLowerCase().includes(authorFilter) ||
          comment.author?.emailAddress?.toLowerCase().includes(authorFilter),
      );
    }

    // Filter by date range if specified
    if (params.dateRange) {
      filtered = filtered.filter((comment) => {
        const commentDate = new Date(comment.created);

        if (params.dateRange?.from) {
          const fromDate = new Date(params.dateRange.from);
          if (commentDate < fromDate) return false;
        }

        if (params.dateRange?.to) {
          const toDate = new Date(params.dateRange.to);
          if (commentDate > toDate) return false;
        }

        return true;
      });
    }

    // Filter internal comments if not requested
    if (!params.includeInternal) {
      filtered = filtered.filter((comment) => {
        // Include comment if it's public (no visibility restrictions and jsdPublic is not false)
        return !comment.visibility && comment.jsdPublic !== false;
      });
    }

    // Apply maxComments limit to final filtered results
    if (params.maxComments && filtered.length > params.maxComments) {
      filtered = filtered.slice(0, params.maxComments);
    }

    return filtered;
  }
}
