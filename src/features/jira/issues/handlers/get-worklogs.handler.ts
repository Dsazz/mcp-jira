/**
 * Get Worklogs Handler
 *
 * MCP tool handler for retrieving worklog entries from JIRA issues
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { WorklogListFormatter } from "@features/jira/issues/formatters";
import type { GetWorklogsUseCase } from "@features/jira/issues/use-cases";
import type {
  GetWorklogsParams,
  WorklogValidator,
} from "@features/jira/issues/validators";

/**
 * Handler for retrieving worklog entries from JIRA issues
 */
export class GetWorklogsHandler extends BaseToolHandler<
  GetWorklogsParams,
  string
> {
  private formatter: WorklogListFormatter;

  /**
   * Create a new GetWorklogsHandler with use case and validator
   *
   * @param getWorklogsUseCase - Use case for retrieving worklog entries
   * @param worklogValidator - Validator for worklog parameters
   */
  constructor(
    private readonly getWorklogsUseCase: GetWorklogsUseCase,
    private readonly worklogValidator: WorklogValidator,
  ) {
    super("JIRA", "Get Worklogs");
    this.formatter = new WorklogListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves worklog entries and formats them
   *
   * @param params - Parameters for worklog retrieval
   */
  protected async execute(params: GetWorklogsParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.worklogValidator.validateGetWorklogsParams(params);
      this.logger.info(
        `Getting worklogs for issue: ${validatedParams.issueKey}`,
      );

      // Step 2: Get worklogs using use case
      const response = await this.getWorklogsUseCase.execute({
        issueKey: validatedParams.issueKey,
      });

      // Step 3: Format worklogs using the formatter
      return this.formatter.format(response.worklogs);
    } catch (error) {
      this.logger.error(`Failed to get worklogs: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetWorklogsParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue Not Found**\n\nNo issue found${issueContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Check if the issue exists\n- Verify you have permission to view the issue\n\n**Example:** \`jira_get_worklogs issueKey="PROJ-123"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view worklog entries${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have browse projects permission\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check the issue key is valid (format: PROJ-123)\n- Verify your JIRA connection\n- Try with a different issue\n\n**Example:** \`jira_get_worklogs issueKey="PROJ-123"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Worklog Retrieval Failed**\n\n${error.message}${issueContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n- Try with a different issue\n\n**Example:** \`jira_get_worklogs issueKey="PROJ-123"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during worklog retrieval${issueContext}.\n\nPlease check your parameters and try again.`,
    );
  }
}
