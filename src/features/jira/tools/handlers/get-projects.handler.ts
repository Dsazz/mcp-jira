/**
 * Get Projects Handler
 *
 * Handles retrieving JIRA projects with comprehensive filtering,
 * permission checking, and professional formatting
 */
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import {
  JiraApiError,
  JiraPermissionError,
} from "@features/jira/api/jira.errors";
import {
  type GetProjectsParams,
  getProjectsParamsSchema,
} from "@features/jira/api/jira.schemas";
import type { GetProjectsOptions, Project } from "../../api/jira.client.types";
import {
  type ProjectListContext,
  ProjectListFormatter,
} from "../../formatters/project-list.formatter";

/**
 * Handler for retrieving JIRA projects
 * Provides comprehensive project discovery with filtering and rich responses
 */
export class GetProjectsHandler extends BaseToolHandler<
  GetProjectsParams,
  string
> {
  private readonly formatter: ProjectListFormatter;

  /**
   * Create a new GetProjectsHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Get Projects");
    this.formatter = new ProjectListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves JIRA projects with comprehensive filtering and formatting
   *
   * @param params - Parameters for project retrieval
   */
  protected async execute(params: GetProjectsParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams = this.validateParameters(params);
      this.logger.info("Retrieving JIRA projects with filters");

      // Step 2: Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Step 3: Transform parameters to API options
      const options = this.transformToApiOptions(validatedParams);

      // Step 4: Retrieve projects
      this.logger.debug("Fetching projects with options:", {
        hasSearch: !!options.searchQuery,
        hasTypeFilter: !!options.typeKey,
        maxResults: options.maxResults,
      });

      const projects = await this.client.getProjects(options);

      // Step 5: Determine context for formatting
      const context = this.buildFormattingContext(validatedParams, projects);

      // Step 6: Format and return response
      this.logger.info(`Successfully retrieved ${projects.length} projects`);
      return this.formatter.format(projects, context);
    } catch (error) {
      this.logger.error(`Failed to retrieve JIRA projects: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Validate parameters using Zod schema
   */
  private validateParameters(params: GetProjectsParams): GetProjectsParams {
    const result = getProjectsParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid project retrieval parameters: ${formatZodError(
        result.error,
      )}`;
      throw new JiraApiError(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Transform handler parameters to API options
   */
  private transformToApiOptions(params: GetProjectsParams): GetProjectsOptions {
    const options: GetProjectsOptions = {};

    if (params.expand) {
      options.expand = params.expand;
    }

    if (params.recent) {
      options.recent = params.recent;
    }

    if (params.typeKey) {
      options.typeKey = params.typeKey;
    }

    if (params.categoryId) {
      options.categoryId = params.categoryId;
    }

    if (params.searchQuery) {
      options.searchQuery = params.searchQuery;
    }

    if (params.orderBy) {
      options.orderBy = params.orderBy;
    }

    if (params.maxResults) {
      options.maxResults = params.maxResults;
    }

    if (params.startAt) {
      options.startAt = params.startAt;
    }

    return options;
  }

  /**
   * Build formatting context from parameters and results
   */
  private buildFormattingContext(
    params: GetProjectsParams,
    projects: Project[],
  ): ProjectListContext {
    const context: ProjectListContext = {};

    if (params.searchQuery) {
      context.searchQuery = params.searchQuery;
    }

    if (params.orderBy) {
      context.orderBy = params.orderBy;
    }

    // Determine if filters were applied
    context.filterApplied = !!(
      params.typeKey ||
      params.categoryId ||
      params.searchQuery ||
      params.recent
    );

    // Check if there might be more results
    if (params.maxResults && projects.length === params.maxResults) {
      context.hasMore = true;
    }

    return context;
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetProjectsParams): Error {
    const filterContext = this.getFilterContext(params);

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view projects${filterContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you're logged in with the correct account\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your filter parameters are valid\n- Try removing filters to see all projects\n- Verify your search query syntax\n- Check project type keys are correct\n\n**Example:** \`jira_get_projects searchQuery="web" typeKey="software"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Project Retrieval Failed**\n\n${error.message}${filterContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Try a simpler query first\n- Verify your JIRA connection\n\n**Example:** \`jira_get_projects maxResults=10\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during project retrieval${filterContext}.\n\nPlease check your parameters and try again.`,
    );
  }

  /**
   * Get filter context for error messages
   */
  private getFilterContext(params?: GetProjectsParams): string {
    if (!params) return "";

    const filters = [];
    if (params.searchQuery) filters.push(`search: "${params.searchQuery}"`);
    if (params.typeKey) filters.push(`type: ${params.typeKey}`);
    if (params.categoryId) filters.push(`category: ${params.categoryId}`);
    if (params.recent) filters.push(`recent: ${params.recent}`);

    return filters.length > 0 ? ` with filters (${filters.join(", ")})` : "";
  }

  /**
   * Get the schema for this handler
   */
  static getSchema() {
    return getProjectsParamsSchema;
  }
}
