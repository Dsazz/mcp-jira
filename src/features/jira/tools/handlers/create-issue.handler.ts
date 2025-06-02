/**
 * Create Issue Handler
 *
 * Handles creating new JIRA issues with comprehensive validation,
 * template support, and professional error handling
 */
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import {
  IssueCreationError,
  IssueTypeValidationError,
  JiraApiError,
  ProjectValidationError,
} from "@features/jira/api/jira.errors";
import {
  type CreateIssueParams,
  applyIssueTemplate,
  createIssueParamsSchema,
  transformToCreateRequest,
} from "@features/jira/api/jira.schemas";
import { IssueCreationFormatter } from "@features/jira/formatters/issue-creation.formatter";

/**
 * Handler for creating new JIRA issues
 * Provides comprehensive issue creation with validation, templates, and rich responses
 */
export class CreateIssueHandler extends BaseToolHandler<
  CreateIssueParams,
  string
> {
  private readonly formatter: IssueCreationFormatter;

  /**
   * Create a new CreateIssueHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Create Issue");
    this.formatter = new IssueCreationFormatter();
  }

  /**
   * Execute the handler logic
   * Creates a new JIRA issue with comprehensive validation and formatting
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

      // Step 2: Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Step 3: Apply template if specified
      const enhancedParams = this.applyTemplate(validatedParams);

      // Step 4: Validate project and issue type
      await this.validateProjectAndIssueType(
        enhancedParams.projectKey,
        enhancedParams.issueType,
      );

      // Step 5: Transform parameters to API request
      const issueRequest = transformToCreateRequest(enhancedParams);

      // Step 6: Create the issue
      this.logger.debug("Creating issue with data:", {
        projectKey: issueRequest.projectKey,
        summary: issueRequest.summary,
        issueType: issueRequest.issueType,
      });

      const createdIssue =
        await this.client.createIssueWithParams(issueRequest);

      // Step 7: Format and return success response
      this.logger.info(`Successfully created issue: ${createdIssue.key}`);
      return this.formatter.format(createdIssue);
    } catch (error) {
      this.logger.error(`Failed to create JIRA issue: ${error}`);
      throw this.enhanceError(error);
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
      throw new IssueCreationError(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Apply template to issue creation parameters if specified
   */
  private applyTemplate(params: CreateIssueParams): CreateIssueParams {
    if (!params.template) {
      return params;
    }

    this.logger.debug(`Applying template: ${params.template}`);

    try {
      return applyIssueTemplate(params, params.template);
    } catch (error) {
      this.logger.warn(
        `Failed to apply template '${params.template}': ${error}`,
      );
      // Continue without template if application fails
      return params;
    }
  }

  /**
   * Validate project exists and issue type is available
   */
  private async validateProjectAndIssueType(
    projectKey: string,
    issueType: string,
  ): Promise<void> {
    if (!this.client) {
      throw new Error("JIRA client not initialized");
    }

    this.logger.debug(
      `Validating project: ${projectKey} and issue type: ${issueType}`,
    );

    try {
      // Validate project exists and user has permissions
      const projectValid = await this.client.validateProject(projectKey);
      if (!projectValid) {
        throw new ProjectValidationError(projectKey);
      }

      // Validate issue type is available for project
      await this.client.validateIssueType(projectKey, issueType);
    } catch (error) {
      if (
        error instanceof ProjectValidationError ||
        error instanceof IssueTypeValidationError
      ) {
        throw error;
      }

      // Re-throw other errors with context
      throw new IssueCreationError(
        `Validation failed for project '${projectKey}' and issue type '${issueType}': ${error}`,
        400,
      );
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown): Error {
    if (error instanceof ProjectValidationError) {
      return new Error(
        `❌ **Project Validation Failed**\n\nProject '${error.projectKey}' not found or you don't have permission to create issues.\n\n**Solutions:**\n- Verify the project key is correct\n- Check your JIRA permissions\n- Use \`jira_get_projects\` to see available projects (when implemented)\n\n**Example:** \`jira_create_issue projectKey=MYPROJ summary="Fix bug" issueType=Bug\``,
      );
    }

    if (error instanceof IssueTypeValidationError) {
      return new Error(
        `❌ **Issue Type Validation Failed**\n\nIssue type '${error.issueType}' is not available for project '${error.projectKey}'.\n\n**Solutions:**\n- Check available issue types in your JIRA project settings\n- Common types: Bug, Task, Story, Epic\n- Use exact case-sensitive names\n\n**Example:** \`jira_create_issue projectKey=${error.projectKey} summary="Fix bug" issueType=Bug\``,
      );
    }

    if (error instanceof IssueCreationError) {
      return new Error(
        `❌ **Issue Creation Failed**\n\n${error.message}\n\n**Solutions:**\n- Check all required fields are provided\n- Verify field values match JIRA requirements\n- Use templates for common issue types: \`template=bug\`, \`template=story\`\n\n**Example:** \`jira_create_issue projectKey=PROJ summary="My issue" issueType=Task template=task\``,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection and credentials\n- Verify your JIRA instance is accessible\n- Try again in a few moments if it's a temporary issue`,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Unexpected Error**\n\n${error.message}\n\nPlease check your parameters and try again.`,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred during issue creation.\n\nPlease check your parameters and try again.",
    );
  }
}
