/**
 * Get Projects Handler
 *
 * MCP tool handler for retrieving JIRA projects with filtering and search capabilities
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { ProjectListFormatter } from "@features/jira/projects/formatters/project-list.formatter";
import type { GetProjectsUseCase } from "@features/jira/issues/use-cases";
import type { GetProjectsParams } from "@features/jira/issues/validators";
import type { ProjectParamsValidator } from "@features/jira/issues/validators";

/**
 * Handler for retrieving JIRA projects
 * Provides comprehensive project listing with filtering and search capabilities
 */
export class GetProjectsHandler extends BaseToolHandler<
  GetProjectsParams,
  string
> {
  private readonly formatter: ProjectListFormatter;

  /**
   * Create a new GetProjectsHandler with use case and validator
   *
   * @param getProjectsUseCase - Use case for retrieving projects
   * @param projectParamsValidator - Validator for project parameters
   */
  constructor(
    private readonly getProjectsUseCase: GetProjectsUseCase,
    private readonly projectParamsValidator: ProjectParamsValidator,
  ) {
    super("JIRA", "Get Projects");
    this.formatter = new ProjectListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves JIRA projects with optional filtering and formatting
   *
   * @param params - Parameters for project retrieval
   */
  protected async execute(params: GetProjectsParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.projectParamsValidator.validateGetProjectsParams(params);
      this.logger.info("Getting JIRA projects");

      // Step 2: Get projects using use case
      this.logger.debug("Retrieving projects with params:", {
        hasSearch: !!validatedParams.searchQuery,
        hasTypeFilter: !!validatedParams.typeKey,
        maxResults: validatedParams.maxResults,
      });

      const projects = await this.getProjectsUseCase.execute(validatedParams);

      // Step 3: Format and return success response
      this.logger.info(`Successfully retrieved ${projects.length} projects`);
      return this.formatter.format(projects);
    } catch (error) {
      this.logger.error(`Failed to get JIRA projects: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetProjectsParams): Error {
    const filterContext = this.getFilterContext(params);

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **No Projects Found**\n\nNo projects found${filterContext}.\n\n**Solutions:**\n- Check your search query is correct\n- Try removing filters to see all projects\n- Verify you have permission to view projects\n\n**Example:** \`jira_get_projects searchQuery="web"\``,
      );
    }

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
   * TODO: We have to specify the schema for the handler
   */
  static getSchema() {
    return {
      type: "object",
      properties: {
        expand: {
          type: "array",
          items: { type: "string" },
        },
        recent: { type: "number" },
        properties: {
          type: "array",
          items: { type: "string" },
        },
        maxResults: { type: "number" },
        startAt: { type: "number" },
        typeKey: { type: "string" },
        categoryId: { type: "number" },
        searchQuery: { type: "string" },
        orderBy: { type: "string" },
      },
    };
  }
}
