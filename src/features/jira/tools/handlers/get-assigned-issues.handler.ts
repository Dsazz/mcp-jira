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
import { IssuesListFormatter } from "@features/jira/formatters/issues-list.formatter";
import type { GetAssignedIssuesUseCase } from "@features/jira/use-cases";

/**
 * Handler for retrieving and formatting issues assigned to the current user
 * Uses the new use case architecture with dependency injection
 */
export class GetAssignedIssuesHandler extends BaseToolHandler<
  Record<string, never>,
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
        "❌ **Permission Denied**\n\nYou don't have permission to view your assigned issues.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you're logged in with the correct account\n\n**Required Permissions:** Browse Projects",
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your authentication is valid\n- Try again later\n\n**Example:** \`jira_get_assigned_issues\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Issue Retrieval Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your authentication is valid\n- Try again later\n\n**Example:** jira_get_assigned_issues`,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred while retrieving your assigned issues.\n\nPlease check your JIRA connection and try again.",
    );
  }

  /**
   * Get the schema for this handler
   * TODO: Add schema for this handler
   */
  static getSchema() {
    return {
      type: "object",
      properties: {},
    };
  }
}
