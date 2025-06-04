/**
 * Delete Worklog Handler
 *
 * MCP tool handler for deleting worklog entries from JIRA issues
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import type { DeleteWorklogUseCase } from "@features/jira/issues/use-cases";
import type {
  DeleteWorklogParams,
  WorklogValidator,
} from "@features/jira/issues/validators";

/**
 * Handler for deleting worklog entries from JIRA issues
 */
export class DeleteWorklogHandler extends BaseToolHandler<
  DeleteWorklogParams,
  string
> {
  /**
   * Create a new DeleteWorklogHandler with use case and validator
   *
   * @param deleteWorklogUseCase - Use case for deleting worklog entries
   * @param worklogValidator - Validator for worklog parameters
   */
  constructor(
    private readonly deleteWorklogUseCase: DeleteWorklogUseCase,
    private readonly worklogValidator: WorklogValidator,
  ) {
    super("JIRA", "Delete Worklog");
  }

  /**
   * Execute the handler logic
   * Deletes a worklog entry and returns a success message
   *
   * @param params - Parameters for worklog deletion
   */
  protected async execute(params: DeleteWorklogParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.worklogValidator.validateDeleteWorklogParams(params);
      this.logger.info(
        `Deleting worklog ${validatedParams.worklogId} from issue: ${validatedParams.issueKey}`,
      );

      // Step 2: Delete worklog using use case
      const response = await this.deleteWorklogUseCase.execute({
        issueKey: validatedParams.issueKey,
        worklogId: validatedParams.worklogId,
      });

      // Step 3: Return success message
      return `✅ **Worklog Deleted Successfully**\n\n${response.message}`;
    } catch (error) {
      this.logger.error(`Failed to delete worklog: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: DeleteWorklogParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";
    const worklogContext = params?.worklogId
      ? ` (worklog ${params.worklogId})`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue or Worklog Not Found**\n\nNo issue or worklog found${issueContext}${worklogContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Verify the worklog ID exists\n- Check if you have permission to view the issue\n\n**Example:** \`jira_delete_worklog issueKey="PROJ-123" worklogId="12345"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to delete worklog entries${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have work on issues permission\n- Ensure you can delete this specific worklog\n\n**Required Permissions:** Work on Issues`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check the issue key is valid (format: PROJ-123)\n- Verify the worklog ID exists\n- Verify your JIRA connection\n\n**Example:** \`jira_delete_worklog issueKey="PROJ-123" worklogId="12345"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Worklog Deletion Failed**\n\n${error.message}${issueContext}${worklogContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n- Verify the worklog ID exists\n\n**Example:** \`jira_delete_worklog issueKey="PROJ-123" worklogId="12345"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during worklog deletion${issueContext}${worklogContext}.\n\nPlease check your parameters and try again.`,
    );
  }
}
