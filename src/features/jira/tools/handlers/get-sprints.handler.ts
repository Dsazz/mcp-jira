/**
 * Get Sprints Handler
 *
 * MCP tool handler for retrieving JIRA sprints with filtering capabilities
 */

import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { SprintListFormatter } from "@features/jira/formatters/sprint-list.formatter";
import type { GetSprintsUseCase } from "@features/jira/use-cases";
import type { GetSprintsParams } from "@features/jira/validators";
import type { SprintValidator } from "@features/jira/validators";

/**
 * Handler for retrieving JIRA sprints
 * Provides comprehensive sprint listing with filtering capabilities
 */
export class GetSprintsHandler extends BaseToolHandler<
  GetSprintsParams,
  string
> {
  private sprintListFormatter: SprintListFormatter;

  /**
   * Create a new GetSprintsHandler with use case and validator
   *
   * @param getSprintsUseCase - Use case for retrieving sprints
   * @param sprintValidator - Validator for sprint parameters
   */
  constructor(
    private readonly getSprintsUseCase: GetSprintsUseCase,
    private readonly sprintValidator: SprintValidator,
  ) {
    super("JIRA", "Get Sprints");
    this.sprintListFormatter = new SprintListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves JIRA sprints with optional filtering and formatting
   *
   * @param params - Parameters for sprint retrieval
   */
  protected async execute(params: GetSprintsParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.sprintValidator.validateGetSprintsParams(params);
      this.logger.info(
        `Getting JIRA sprints for board: ${validatedParams.boardId}`,
      );

      // Step 2: Get sprints using use case
      this.logger.debug("Retrieving sprints with params:", {
        boardId: validatedParams.boardId,
        hasState: !!validatedParams.state,
        maxResults: validatedParams.maxResults,
      });

      const sprints = await this.getSprintsUseCase.execute(validatedParams);

      // Step 3: Format and return success response
      this.logger.info(`Successfully retrieved ${sprints.length} sprints`);
      return this.sprintListFormatter.format({
        sprints,
        boardId: validatedParams.boardId,
        appliedFilters: {
          state: validatedParams.state,
          boardId: validatedParams.boardId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get JIRA sprints: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetSprintsParams): Error {
    const boardContext = params?.boardId ? ` for board ${params.boardId}` : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **No Sprints Found**\n\nNo sprints found${boardContext}.\n\n**Solutions:**\n- Verify the board ID is correct\n- Check if the board has any sprints created\n- Try removing state filters to see all sprints\n- Use \`jira_get_boards\` to find valid board IDs\n\n**Example:** \`jira_get_sprints boardId=123\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view sprints${boardContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have access to the board\n- Use \`jira_get_boards\` to see accessible boards\n\n**Required Permissions:** Browse Projects`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the board ID is valid\n- Check your filter parameters\n- Try with a different board\n- Ensure the board supports sprints (Scrum boards)\n\n**Example:** \`jira_get_sprints boardId=123 state="active"\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Sprint Retrieval Failed**\n\n${error.message}${boardContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Try a simpler query first\n- Verify your JIRA connection\n\n**Example:** \`jira_get_sprints boardId=123\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during sprint retrieval${boardContext}.\n\nPlease check your parameters and try again.`,
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
        boardId: { type: "number" },
        state: { type: "string" },
        maxResults: { type: "number" },
        startAt: { type: "number" },
      },
      required: ["boardId"],
    };
  }
}
