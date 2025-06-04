/**
 * Add Worklog Handler
 *
 * MCP tool handler for adding worklog entries to JIRA issues
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { WorklogEntryFormatter } from "@features/jira/issues/formatters";
import type { AddWorklogUseCase } from "@features/jira/issues/use-cases";
import type {
  AddWorklogParams,
  WorklogValidator,
} from "@features/jira/issues/validators";

/**
 * Handler for adding worklog entries to JIRA issues
 */
export class AddWorklogHandler extends BaseToolHandler<
  AddWorklogParams,
  string
> {
  private formatter: WorklogEntryFormatter;

  /**
   * Create a new AddWorklogHandler with use case and validator
   *
   * @param addWorklogUseCase - Use case for adding worklog entries
   * @param worklogValidator - Validator for worklog parameters
   */
  constructor(
    private readonly addWorklogUseCase: AddWorklogUseCase,
    private readonly worklogValidator: WorklogValidator,
  ) {
    super("JIRA", "Add Worklog");
    this.formatter = new WorklogEntryFormatter();
  }

  /**
   * Execute the handler logic
   * Adds a worklog entry and formats the result
   *
   * @param params - Parameters for worklog addition
   */
  protected async execute(params: AddWorklogParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.worklogValidator.validateAddWorklogParams(params);
      this.logger.info(`Adding worklog to issue: ${validatedParams.issueKey}`, {
        timeSpent: validatedParams.timeSpent,
      });

      // Step 2: Add worklog using use case
      const response = await this.addWorklogUseCase.execute({
        issueKey: validatedParams.issueKey,
        timeSpent: validatedParams.timeSpent,
        comment: validatedParams.comment,
        started: validatedParams.started,
      });

      // Step 3: Format worklog using the formatter
      return this.formatter.format(response.worklog);
    } catch (error) {
      this.logger.error(`Failed to add worklog: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: AddWorklogParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue Not Found**\n\nNo issue found${issueContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Check if the issue exists\n- Verify you have permission to view the issue\n\n**Example:** \`jira_add_worklog issueKey="PROJ-123" timeSpent="2h"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to add worklog entries${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have work on issues permission\n\n**Required Permissions:** Work on Issues`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the time format (e.g., "2h", "30m", "1d")\n- Check the issue key is valid (format: PROJ-123)\n- Verify the started date is in ISO format\n\n**Example:** \`jira_add_worklog issueKey="PROJ-123" timeSpent="2h" comment="Fixed bug"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Worklog Addition Failed**\n\n${error.message}${issueContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n- Ensure time format is correct (e.g., "2h", "30m")\n\n**Example:** \`jira_add_worklog issueKey="PROJ-123" timeSpent="2h"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during worklog addition${issueContext}.\n\nPlease check your parameters and try again.`,
    );
  }
}
