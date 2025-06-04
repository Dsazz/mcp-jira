/**
 * Get Sprint Handler
 *
 * MCP tool handler for retrieving a single JIRA sprint by ID
 */

import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { SprintFormatter } from "@features/jira/sprints/formatters/sprint.formatter";
import type { GetSprintUseCase } from "../use-cases/get-sprint.use-case";
import type { GetSprintParams } from "../validators/sprint.validator";
import type { SprintValidator } from "../validators/sprint.validator";

/**
 * Handler for retrieving a single JIRA sprint by ID
 * Provides detailed information about a specific sprint
 */
export class GetSprintHandler extends BaseToolHandler<
  GetSprintParams,
  string
> {
  private sprintFormatter: SprintFormatter;

  /**
   * Create a new GetSprintHandler with use case and validator
   *
   * @param getSprintUseCase - Use case for retrieving a sprint
   * @param sprintValidator - Validator for sprint parameters
   */
  constructor(
    private readonly getSprintUseCase: GetSprintUseCase,
    private readonly sprintValidator: SprintValidator,
  ) {
    super("JIRA", "Get Sprint");
    this.sprintFormatter = new SprintFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves a single JIRA sprint by ID with detailed formatting
   * 
   * @param params - Parameters for sprint retrieval
   */
  protected async execute(params: GetSprintParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams =
        this.sprintValidator.validateGetSprintParams(params);
      this.logger.info(
        `Getting JIRA sprint: ${validatedParams.sprintId}`,
      );

      // Step 2: Get sprint using use case
      this.logger.debug("Retrieving sprint with ID:", {
        sprintId: validatedParams.sprintId,
      });

      const sprint = await this.getSprintUseCase.execute(validatedParams);

      // Step 3: Format and return success response
      this.logger.info(`Successfully retrieved sprint: ${sprint.id}`);
      return this.sprintFormatter.format(sprint);
    } catch (error) {
      this.logger.error(`Failed to get JIRA sprint: ${error}`);
      throw this.enhanceError(error, params);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, params?: GetSprintParams): Error {
    const sprintContext = params?.sprintId ? ` with ID ${params.sprintId}` : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Sprint Not Found**\n\nThe requested sprint${sprintContext} could not be found.\n\n**Solutions:**\n- Verify the sprint ID is correct\n- Check if the sprint has been deleted\n- Use \`jira_get_sprints\` to list available sprints\n\n**Example:** \`jira_get_sprint sprintId=123\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to view sprint${sprintContext}.\n\n**Solutions:**\n- Check your JIRA permissions\n- Contact your JIRA administrator\n- Verify you have access to the associated board\n\n**Required Permissions:** Browse Projects`,
       );
     }

     if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Verify the sprint ID is valid\n- Check your JIRA connection\n- Try with a different sprint\n\n**Example:** \`jira_get_sprint sprintId=123\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Sprint Retrieval Failed**\n\n${error.message}${sprintContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify your JIRA connection\n\n**Example:** \`jira_get_sprint sprintId=123\``,
       );
     }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during sprint retrieval${sprintContext}.\n\nPlease check your parameters and try again.`,
    );
  }

  /**
   * Get the schema for this handler
   */
  static getSchema() {
    return {
      type: "object",
      properties: {
        sprintId: { type: "number" },
      },
      required: ["sprintId"],
    };
  }
} 