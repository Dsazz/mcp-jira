/**
 * Get Assigned Issues Handler
 *
 * MCP tool handler for retrieving issues assigned to the current user
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { IssuesListFormatter } from "@features/jira/issues/formatters/issues-list.formatter";
import type { GetAssignedIssuesUseCase } from "@features/jira/issues/use-cases";
import type { GetAssignedIssuesParams } from "@features/jira/issues/validators";

/**
 * Handler for retrieving and formatting issues assigned to the current user
 * Uses the new use case architecture with dependency injection
 */
export class GetAssignedIssuesHandler extends BaseToolHandler<
  GetAssignedIssuesParams,
  string
> {
  private formatter: IssuesListFormatter;

  /**
   * Create a new GetAssignedIssuesHandler with use case
   *
   * @param getAssignedIssuesUseCase - Use case for retrieving assigned issues
   */
  constructor(
    private readonly getAssignedIssuesUseCase: GetAssignedIssuesUseCase,
  ) {
    super("JIRA", "Get Assigned Issues");
    this.formatter = new IssuesListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves issues assigned to the current user and formats them
   */
  protected async execute(): Promise<string> {
    try {
      this.logger.info("Getting issues assigned to current user");

      // Get assigned issues using use case
      const assignedIssues = await this.getAssignedIssuesUseCase.execute();

      // Format the issues using the formatter
      return this.formatter.format(assignedIssues);
    } catch (error) {
      this.logger.error(`Failed to get assigned issues: ${error}`);
      throw this.enhanceError(error);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown): Error {
    if (error instanceof JiraNotFoundError) {
      return new Error(
        "❌ **No Assigned Issues Found**\n\nNo issues are currently assigned to you.\n\n**Solutions:**\n- Verify you have JIRA issues assigned to your account\n- Check your JIRA permissions\n\n**Example:** `jira_get_assigned_issues`",
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to search for issues.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have access to projects\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your user account is valid\n- Try again in a few moments\n\n**Note:** This searches for issues assigned to your user account`,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Search Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your permissions\n- Try again in a few moments\n\n**Note:** This searches for issues assigned to you`,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred while searching for assigned issues.\n\nPlease try again.",
    );
  }
}
