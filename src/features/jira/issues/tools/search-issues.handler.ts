/**
 * Search Issues Handler
 *
 * MCP tool handler for searching JIRA issues using JQL queries and filters
 * Refactored to use the use-case pattern for better separation of concerns
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import { formatZodError } from "@core/utils/validation";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { IssueListFormatter } from "@features/jira/issues/formatters/issue-list.formatter";
import {
  type SearchJiraIssuesParams,
  searchJiraIssuesBaseSchema,
} from "@features/jira/issues/use-cases";
import type {
  SearchIssuesUseCase,
  SearchIssuesUseCaseRequest,
} from "@features/jira/issues/use-cases";

/**
 * Handler for searching and formatting JIRA issues
 * Uses the use-case pattern for separation of concerns
 */
export class SearchIssuesHandler extends BaseToolHandler<
  SearchJiraIssuesParams,
  string
> {
  private readonly formatter: IssueListFormatter;

  /**
   * Create a new SearchIssuesHandler with use case
   *
   * @param searchIssuesUseCase - Use case for searching issues with validation
   */
  constructor(private readonly searchIssuesUseCase: SearchIssuesUseCase) {
    super("JIRA", "Search Issues");
    this.formatter = new IssueListFormatter();
  }

  /**
   * Execute the handler logic
   * Searches for JIRA issues using JQL query and formats results
   * Delegates business logic to the use case
   *
   * @param params - Search parameters with JQL or helper parameters
   */
  protected async execute(params: SearchJiraIssuesParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams = this.validateParameters(params);
      this.logger.info("Searching JIRA issues");

      // Step 2: Map parameters to use case request
      const useCaseRequest: SearchIssuesUseCaseRequest =
        this.mapToUseCaseRequest(validatedParams);

      // Step 3: Execute the use case
      this.logger.debug("Delegating to SearchIssuesUseCase", {
        jql: validatedParams.jql,
        hasFilters:
          !validatedParams.jql &&
          (!!validatedParams.text ||
            !!validatedParams.project ||
            !!validatedParams.status ||
            !!validatedParams.assignedToMe),
      });

      const issues = await this.searchIssuesUseCase.execute(useCaseRequest);

      // Step 4: Format and return success response
      this.logger.info(`Successfully found ${issues.length} issues`);
      return this.formatter.format(issues);
    } catch (error) {
      this.logger.error(`Failed to search JIRA issues: ${error}`);
      throw this.enhanceError(error);
    }
  }

  /**
   * Validate parameters using Zod schema
   */
  private validateParameters(
    params: SearchJiraIssuesParams,
  ): SearchJiraIssuesParams {
    const result = searchJiraIssuesBaseSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid search parameters: ${formatZodError(
        result.error,
      )}`;
      throw JiraApiError.withStatusCode(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Map handler parameters to use case request
   * TODO: We have to specify a special mapper for this
   */
  private mapToUseCaseRequest(
    params: SearchJiraIssuesParams,
  ): SearchIssuesUseCaseRequest {
    return {
      jql: params.jql,
      text: params.text,
      project: params.project,
      status: params.status,
      assignedToMe: params.assignedToMe,
      maxResults: params.maxResults,
      fields: params.fields,
    };
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown): Error {
    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **No Issues Found**\n\nNo issues found matching your search criteria.\n\n**Solutions:**\n- Try broadening your search terms\n- Check your JQL syntax if using custom queries\n- Verify you have permission to view the projects\n\n**Example:** \`search_jira_issues text="bug" project="PROJ"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to search issues.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you're logged in with the correct account\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your JQL syntax if using custom queries\n- Verify project keys are correct\n- Try simpler search criteria\n\n**Example:** \`search_jira_issues jql="project = PROJ AND status = Open"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Search Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your search parameters are valid\n- Try a simpler query first\n- Verify your JIRA connection\n\n**Example:** \`search_jira_issues text="bug"\``,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred during issue search.\n\nPlease check your parameters and try again.",
    );
  }

  /**
   * Get the schema for this handler
   */
  static getSchema() {
    return searchJiraIssuesBaseSchema;
  }
}
