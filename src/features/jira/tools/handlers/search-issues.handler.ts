/**
 * Search Issues Handler
 *
 * MCP tool handler for searching JIRA issues with JQL or helper parameters
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import { formatZodError } from "@core/utils/validation";
import {
  type SearchJiraIssuesParams,
  buildJQLFromHelpers,
  searchJiraIssuesSchema,
} from "@features/jira/api";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import { IssuesListFormatter } from "@features/jira/formatters/issues-list.formatter";

// List of fields to retrieve for each issue in search results
const SEARCH_FIELDS = [
  "summary",
  "description",
  "status",
  "priority",
  "assignee",
  "reporter",
  "created",
  "updated",
  "labels",
];

/**
 * Handler for searching and formatting JIRA issues
 */
export class SearchIssuesHandler extends BaseToolHandler<
  SearchJiraIssuesParams,
  string
> {
  private formatter: IssuesListFormatter;

  /**
   * Create a new SearchIssuesHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Search Issues");
    this.formatter = new IssuesListFormatter();
  }

  /**
   * Execute the handler logic
   * Searches for JIRA issues using JQL query and formats results
   *
   * @param params - Search parameters with JQL or helper parameters
   */
  protected async execute(params: SearchJiraIssuesParams): Promise<string> {
    try {
      // Validate parameters
      const result = searchJiraIssuesSchema.safeParse(params);
      if (!result.success) {
        const errorMessage = `Invalid search parameters: ${formatZodError(
          result.error,
        )}`;
        throw new Error(errorMessage);
      }

      const searchParams = result.data;

      this.logger.info(
        `Searching JIRA issues with params: ${JSON.stringify(searchParams)}`,
      );

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Build JQL query from parameters
      const jqlQuery = buildJQLFromHelpers(searchParams);
      this.logger.info(`Generated JQL query: ${jqlQuery}`);

      // Determine fields to retrieve
      const fields = searchParams.fields || SEARCH_FIELDS;

      // Search for issues using the JIRA client
      const issues = await this.client.searchIssues(
        jqlQuery,
        fields,
        searchParams.maxResults,
      );

      // Format the search results using the formatter
      return this.formatter.format(issues, {
        query: searchParams.jql ? searchParams.jql : "Helper parameters",
        totalResults: issues.length,
        maxResults: searchParams.maxResults,
        searchParams,
      });
    } catch (error) {
      this.logger.error(`Failed to search issues: ${error}`);
      throw error;
    }
  }
}
