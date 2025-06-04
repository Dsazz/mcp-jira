/**
 * Get Issue Handler
 *
 * MCP tool handler for retrieving JIRA issue details
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { IssueFormatter } from "@features/jira/issues/formatters/issue.formatter";
import type { GetIssueUseCase } from "@features/jira/issues/use-cases";
import type {
  GetIssueParams,
  IssueParamsValidator,
} from "@features/jira/issues/validators";

/**
 * Handler for retrieving and formatting JIRA issue details
 */
export class GetIssueHandler extends BaseToolHandler<GetIssueParams, string> {
  private formatter: IssueFormatter;

  /**
   * Create a new GetIssueHandler with use case and validator
   *
   * @param getIssueUseCase - Use case for retrieving issue details
   * @param issueParamsValidator - Validator for issue parameters
   */
  constructor(
    private readonly getIssueUseCase: GetIssueUseCase,
    private readonly issueParamsValidator: IssueParamsValidator,
  ) {
    super("JIRA", "Get Issue");
    this.formatter = new IssueFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves issue details and formats them using the formatter
   *
   * @param params - Parameters for issue retrieval
   */
  protected async execute(params: GetIssueParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.issueParamsValidator.validateGetIssueParams(params);
      this.logger.info(`Getting JIRA issue: ${validatedParams.issueKey}`);

      // Step 2: Get issue using use case
      const issue = await this.getIssueUseCase.execute(validatedParams);

      // Step 3: Format issue using the formatter
      return this.formatter.format(issue);
    } catch (error) {
      this.logger.error(`Failed to get issue: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetIssueParams): Error {
    const issueContext = params?.issueKey
      ? ` for issue ${params.issueKey}`
      : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue Not Found**\n\nNo issue found${issueContext}.\n\n**Solutions:**\n- Verify the issue key is correct\n- Check if the issue exists\n- Verify you have permission to view the issue\n\n**Example:** \`jira_get_issue issueKey="PROJ-123"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view the issue${issueContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have access to the project\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the issue key is valid (format: PROJ-123)\n- Check your JIRA connection\n- Try with a different issue\n\n**Example:** \`jira_get_issue issueKey="PROJ-123"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Issue Retrieval Failed**\n\n${error.message}${issueContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n- Try with a different issue\n\n**Example:** \`jira_get_issue issueKey="PROJ-123"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during issue retrieval${issueContext}.\n\nPlease check your parameters and try again.`,
    );
  }

  /**
   * Get the schema for this handler
   * TODO: We have to specify the schema for the handler
   */
  static getSchema() {
    return {
      type: "object",
      properties: {
        issueKey: { type: "string" },
        fields: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["issueKey"],
    };
  }
}
