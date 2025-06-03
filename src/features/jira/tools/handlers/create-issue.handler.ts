/**
 * Create Issue Handler
 *
 * MCP tool handler for creating new JIRA issues with comprehensive validation
 * Refactored to use the use-case pattern for better separation of concerns
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import { formatZodError } from "@core/utils/validation";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import {
  type CreateIssueParams,
  createIssueParamsSchema,
} from "@features/jira/use-cases";
import type {
  CreateIssueUseCase,
  CreateIssueUseCaseRequest,
} from "@features/jira/use-cases";
import { IssueCreationFormatter } from "@features/jira/formatters/issue-creation.formatter";
import { IssueCreateParamsValidationError } from "@features/jira/validators/errors";

/**
 * Handler for creating new JIRA issues
 * Provides comprehensive issue creation with validation and rich responses
 * Uses the use-case pattern for separation of concerns
 */
export class CreateIssueHandler extends BaseToolHandler<
  CreateIssueParams,
  string
> {
  private readonly formatter: IssueCreationFormatter;

  /**
   * Create a new CreateIssueHandler with necessary dependencies
   *
   * @param createIssueUseCase - Use case for creating issues with validation
   * @param projectValidator - Validator for project-related validation
   * @param permissionChecker - Checker for permission-related validation
   */
  constructor(private readonly createIssueUseCase: CreateIssueUseCase) {
    super("JIRA", "Create Issue");
    this.formatter = new IssueCreationFormatter();
  }

  /**
   * Execute the handler logic
   * Creates a new JIRA issue with comprehensive validation and formatting
   * Delegates business logic to the use case
   *
   * @param params - Parameters for issue creation
   */
  protected async execute(params: CreateIssueParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams = this.validateParameters(params);
      this.logger.info(
        `Creating JIRA issue in project: ${validatedParams.projectKey}`,
      );

      // Step 2: Map parameters to use case request
      const useCaseRequest: CreateIssueUseCaseRequest = {
        projectKey: validatedParams.projectKey,
        summary: validatedParams.summary,
        issueType: validatedParams.issueType,
        description: validatedParams.description,
        customFields: validatedParams.customFields,
      };

      // Step 3: Execute the use case
      this.logger.debug("Delegating to CreateIssueUseCase", {
        projectKey: validatedParams.projectKey,
        issueType: validatedParams.issueType,
        summary: validatedParams.summary,
      });

      const createdIssue =
        await this.createIssueUseCase.execute(useCaseRequest);

      // Step 4: Format and return success response
      this.logger.info(`Successfully created issue: ${createdIssue.key}`);
      return this.formatter.format(createdIssue);
    } catch (error) {
      this.logger.error(`Failed to create JIRA issue: ${error}`);
      throw this.enhanceError(error, params.projectKey, params.issueType);
    }
  }

  /**
   * Validate parameters using Zod schema
   */
  private validateParameters(params: CreateIssueParams): CreateIssueParams {
    const result = createIssueParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid issue creation parameters: ${formatZodError(
        result.error,
      )}`;
      throw new IssueCreateParamsValidationError(errorMessage);
    }

    return result.data;
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(
    error: unknown,
    projectKey?: string,
    issueType?: string,
  ): Error {
    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Project Not Found**\n\nProject '${projectKey}' not found or you don't have permission to create issues.\n\n**Solutions:**\n- Verify the project key is correct\n- Check your JIRA permissions\n- Use \`jira_get_projects\` to see available projects\n\n**Example:** \`jira_create_issue projectKey=MYPROJ summary="Fix bug" issueType=Bug\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to create issues in project '${projectKey}'.\n\n**Solutions:**\n- Check your JIRA permissions for this project\n- Contact your JIRA administrator\n- Verify you have CREATE_ISSUES permission\n\n**Required Permissions:** Create Issues`,
      );
    }

    if (error instanceof IssueCreateParamsValidationError) {
      return new Error(
        `❌ **Validation Error**\n\n${error.message}\n\n**Solutions:**\n- Check the format of all parameters\n- Ensure required fields are provided\n- Verify field values match expected formats\n\n**Example:** \`jira_create_issue projectKey=PROJ summary="My issue" issueType=Task\``,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check all required fields are provided\n- Verify field values match JIRA requirements\n- Ensure issue type '${issueType}' exists in project '${projectKey}'\n\n**Example:** \`jira_create_issue projectKey=PROJ summary="My issue" issueType=Task\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Creation Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify the project and issue type exist\n- Try with minimal required fields first\n\n**Example:** \`jira_create_issue projectKey=PROJ summary="Test issue" issueType=Task\``,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred during issue creation.\n\nPlease check your parameters and try again.",
    );
  }

  /**
   * Get the schema for this handler
   */
  static getSchema() {
    return createIssueParamsSchema;
  }
}
