/**
 * Update Worklog Handler
 *
 * MCP tool handler for updating worklog entries in JIRA issues
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { WorklogEntryFormatter } from "@features/jira/issues/formatters";
import type { UpdateWorklogUseCase } from "@features/jira/issues/use-cases";
import type {
  UpdateWorklogParams,
  WorklogValidator,
} from "@features/jira/issues/validators";

/**
 * Handler for updating worklog entries in JIRA issues
 */
export class UpdateWorklogHandler extends BaseToolHandler<
  UpdateWorklogParams,
  string
> {
  private formatter: WorklogEntryFormatter;

  /**
   * Create a new UpdateWorklogHandler with use case and validator
   *
   * @param updateWorklogUseCase - Use case for updating worklog entries
   * @param worklogValidator - Validator for worklog parameters
   */
  constructor(
    private readonly updateWorklogUseCase: UpdateWorklogUseCase,
    private readonly worklogValidator: WorklogValidator,
  ) {
    super("JIRA", "Update Worklog");
    this.formatter = new WorklogEntryFormatter();
  }

  /**
   * Execute the handler logic
   * Updates a worklog entry and formats the result
   *
   * @param params - Parameters for worklog update
   */
  protected async execute(params: UpdateWorklogParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.worklogValidator.validateUpdateWorklogParams(params);
      this.logger.info(
        `Updating worklog ${validatedParams.worklogId} for issue: ${validatedParams.issueKey}`,
      );

      // Step 2: Update worklog using use case
      const response = await this.updateWorklogUseCase.execute({
        issueKey: validatedParams.issueKey,
        worklogId: validatedParams.worklogId,
        timeSpent: validatedParams.timeSpent,
        comment: validatedParams.comment,
        started: validatedParams.started,
      });

      // Step 3: Format worklog using the formatter
      return this.formatter.format(response.worklog);
    } catch (error) {
      this.logger.error(`Failed to update worklog: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: UpdateWorklogParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";
    const worklogContext = params?.worklogId
      ? ` (worklog ${params.worklogId})`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue or Worklog Not Found**\n\nNo issue or worklog found${issueContext}${worklogContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Verify the worklog ID exists\n- Check if you have permission to view the issue\n\n**Example:** \`jira_update_worklog issueKey="PROJ-123" worklogId="12345" timeSpent="3h"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to update worklog entries${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have work on issues permission\n- Ensure you can edit this specific worklog\n\n**Required Permissions:** Work on Issues`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the time format (e.g., "2h", "30m", "1d")\n- Check the issue key is valid (format: PROJ-123)\n- Verify the worklog ID exists\n- Verify the started date is in ISO format\n\n**Example:** \`jira_update_worklog issueKey="PROJ-123" worklogId="12345" timeSpent="3h"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Worklog Update Failed**\n\n${error.message}${issueContext}${worklogContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n- Ensure time format is correct (e.g., "2h", "30m")\n- Verify the worklog ID exists\n\n**Example:** \`jira_update_worklog issueKey="PROJ-123" worklogId="12345" timeSpent="3h"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during worklog update${issueContext}${worklogContext}.\n\nPlease check your parameters and try again.`,
    );
  }
}
