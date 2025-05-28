/**
 * Search Issues Handler
 *
 * Handles searching JIRA issues using JQL queries with helper parameters
 */
import {
  createErrorResponse,
  createSuccessResponse,
} from "@core/responses";
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import type { JiraClient } from "../../api/jira.client.impl";
import { IssuesListFormatter } from "../../formatters/issues-list.formatter";
import { 
  searchJiraIssuesSchema, 
  buildJQLFromHelpers,
  type SearchJiraIssuesParams 
} from "../utils/schemas";

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
      this.logger.info(`Searching JIRA issues with params: ${JSON.stringify(params)}`);

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Build JQL query from parameters
      const jqlQuery = buildJQLFromHelpers(params);
      this.logger.info(`Generated JQL query: ${jqlQuery}`);

      // Determine fields to retrieve
      const fields = params.fields || SEARCH_FIELDS;

      // Search for issues using the JIRA client
      const issues = await this.client.searchIssues(
        jqlQuery,
        fields,
        params.maxResults
      );

      // Format the search results using the formatter
      return this.formatter.format(issues, {
        query: params.jql ? params.jql : "Helper parameters",
        totalResults: issues.length,
        maxResults: params.maxResults,
        searchParams: params,
      });
    } catch (error) {
      this.logger.error(`Failed to search issues: ${error}`);
      throw error;
    }
  }

  /**
   * Handle the request for searching JIRA issues
   *
   * @param params - Request parameters
   * @returns Response object with success/error status
   */
  async handler(params: unknown) {
    console.info(
      `[JIRA:Search Issues] Searching issues with params: ${JSON.stringify(params)}`
    );

    try {
      // Validate and parse parameters
      const result = searchJiraIssuesSchema.safeParse(params);
      if (!result.success) {
        const errorMessage = `Invalid search parameters: ${formatZodError(
          result.error,
        )}`;
        throw new Error(errorMessage);
      }

      // Extract validated parameters
      const searchParams = result.data;

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Build JQL query from parameters
      const jqlQuery = buildJQLFromHelpers(searchParams);
      console.info(`[JIRA:Search Issues] Generated JQL: ${jqlQuery}`);

      // Determine fields to retrieve
      const fields = searchParams.fields || SEARCH_FIELDS;

      // Search for issues using the JIRA client
      const issues = await this.client.searchIssues(
        jqlQuery,
        fields,
        searchParams.maxResults
      );

      console.info(`[JIRA:Search Issues] Found ${issues.length} issues`);

      // Format the search results for display using the formatter
      const formattedResults = this.formatter.format(issues, {
        query: searchParams.jql ? searchParams.jql : "Helper parameters",
        totalResults: issues.length,
        maxResults: searchParams.maxResults,
        searchParams,
      });

      // Return successful response
      return createSuccessResponse({
        formattedText: formattedResults,
      });
    } catch (error) {
      console.error(
        `[JIRA:Search Issues] Failed to search issues: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      console.error(
        `[JIRA:Search Issues:${
          error instanceof Error ? error : String(error)
        }] Tool execution failed`
      );

      return createErrorResponse(
        `Failed to search issues: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
} 