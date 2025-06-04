/**
 * Get Issue Comments Handler
 *
 * MCP tool handler for retrieving JIRA issue comments
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import {
  type CommentsContext,
  CommentsFormatter,
} from "@features/jira/issues/formatters/comments.formatter";
import type { GetIssueCommentsUseCase } from "@features/jira/issues/use-cases";
import type {
  GetIssueCommentsParams,
  IssueCommentValidator,
} from "@features/jira/issues/validators";

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
   * Create a new GetIssueCommentsHandler with use case and validator
   *
   * @param getIssueCommentsUseCase - Use case for issue comment operations
   * @param issueCommentValidator - Validator for issue comment parameters
   */
  constructor(
    private readonly getIssueCommentsUseCase: GetIssueCommentsUseCase,
    private readonly issueCommentValidator: IssueCommentValidator,
  ) {
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
      // Step 1: Validate parameters
      const validatedParams =
        this.issueCommentValidator.validateGetCommentsParams(params);
      this.logger.info(
        `Getting comments for JIRA issue: ${validatedParams.issueKey}`,
      );

      // Step 2: Get comments using use case
      this.logger.debug("Retrieving comments with params:", {
        issueKey: validatedParams.issueKey,
        hasAuthorFilter: !!validatedParams.authorFilter,
        hasDateRange: !!validatedParams.dateRange,
        includeInternal: validatedParams.includeInternal,
        maxComments: validatedParams.maxComments,
      });

      const comments =
        await this.getIssueCommentsUseCase.execute(validatedParams);

      // Step 3: Create formatting context
      const context: CommentsContext = {
        issueKey: validatedParams.issueKey,
        totalComments: comments.length,
        maxDisplayed: comments.length,
      };

      // Step 4: Format the comments using the formatter
      return this.formatter.format({ comments, context });
    } catch (error) {
      this.logger.error(`Failed to get comments: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetIssueCommentsParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **No Comments Found**\n\nNo comments found${issueContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Check if the issue has any comments\n- Try including internal comments\n- Use \`jira_get_issue\` to verify the issue exists\n\n**Example:** \`jira_get_issue_comments issueKey="PROJ-123"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view comments${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have access to the issue\n- Use \`jira_get_issue\` to see accessible issues\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the issue key is valid\n- Check your filter parameters\n- Try with different filters\n\n**Example:** \`jira_get_issue_comments issueKey="PROJ-123" maxComments=5\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Comments Retrieval Failed**\n\n${error.message}${issueContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Try a simpler query first\n- Verify your JIRA connection\n\n**Example:** \`jira_get_issue_comments issueKey="PROJ-123"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during comment retrieval${issueContext}.\n\nPlease check your parameters and try again.`,
    );
  }
}
