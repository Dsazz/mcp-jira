/**
 * Get Boards Handler
 *
 * MCP tool handler for retrieving JIRA boards with filtering capabilities
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { BoardListFormatter } from "@features/jira/formatters/board-list.formatter";
import type { GetBoardsUseCase } from "@features/jira/use-cases";
import type { GetBoardsParams } from "@features/jira/validators";
import type { BoardValidator } from "@features/jira/validators";

/**
 * Handler for retrieving JIRA boards
 * Provides comprehensive board listing with filtering capabilities
 */
export class GetBoardsHandler extends BaseToolHandler<GetBoardsParams, string> {
  private boardListFormatter: BoardListFormatter;

  /**
   * Create a new GetBoardsHandler with use case and validator
   *
   * @param getBoardsUseCase - Use case for retrieving boards
   * @param boardValidator - Validator for board parameters
   */
  constructor(
    private readonly getBoardsUseCase: GetBoardsUseCase,
    private readonly boardValidator: BoardValidator,
  ) {
    super("JIRA", "Get Boards");
    this.boardListFormatter = new BoardListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves JIRA boards with optional filtering and formatting
   *
   * @param params - Parameters for board retrieval
   */
  protected async execute(params: GetBoardsParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.boardValidator.validateGetBoardsParams(params);
      this.logger.info("Getting JIRA boards");

      // Step 2: Get boards using use case
      this.logger.debug("Retrieving boards with params:", {
        hasType: !!validatedParams.type,
        hasProject: !!validatedParams.projectKeyOrId,
        hasName: !!validatedParams.name,
        maxResults: validatedParams.maxResults,
      });

      const boards = await this.getBoardsUseCase.execute(validatedParams);

      // Step 3: Format and return success response
      this.logger.info(`Successfully retrieved ${boards.length} boards`);
      return this.boardListFormatter.format({
        boards,
        appliedFilters: {
          type: validatedParams.type,
          projectKeyOrId: validatedParams.projectKeyOrId,
          name: validatedParams.name,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get JIRA boards: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetBoardsParams): Error {
    const filterContext = this.getFilterContext(params);

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **No Boards Found**\n\nNo boards found${filterContext}.\n\n**Solutions:**\n- Check your search criteria are correct\n- Try removing filters to see all boards\n- Verify you have permission to view boards\n\n**Example:** \`jira_get_boards type="scrum"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view boards${filterContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you're logged in with the correct account\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your filter parameters are valid\n- Try removing filters to see all boards\n- Verify your project key is correct\n- Check board type is valid (scrum, kanban, simple)\n\n**Example:** \`jira_get_boards projectKeyOrId="PROJ" type="scrum"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Board Retrieval Failed**\n\n${error.message}${filterContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Try a simpler query first\n- Verify your JIRA connection\n\n**Example:** \`jira_get_boards maxResults=10\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during board retrieval${filterContext}.\n\nPlease check your parameters and try again.`,
    );
  }

  /**
   * Get filter context for error messages
   */
  private getFilterContext(params?: GetBoardsParams): string {
    if (!params) return "";

    const filters = [];
    if (params.type) filters.push(`type: ${params.type}`);
    if (params.projectKeyOrId)
      filters.push(`project: ${params.projectKeyOrId}`);
    if (params.name) filters.push(`name: "${params.name}"`);

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
        type: { type: "string" },
        projectKeyOrId: { type: "string" },
        name: { type: "string" },
        maxResults: { type: "number" },
        startAt: { type: "number" },
        orderBy: { type: "string" },
      },
    };
  }
}
