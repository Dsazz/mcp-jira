/**
 * Update Issue Handler
 *
 * Handles updating existing JIRA issues with comprehensive validation,
 * status transitions, array operations, and professional error handling
 * Refactored to use the use-case pattern for better separation of concerns
 */
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { IssueUpdateFormatter } from "@features/jira/issues/formatters/issue-update.formatter";
import {
  type UpdateIssueParams,
  type UpdateIssueUseCase,
  type UpdateIssueUseCaseRequest,
  updateIssueParamsSchema,
} from "@features/jira/issues/use-cases";
import { IssueUpdateParamsValidationError } from "@features/jira/issues/validators/errors";
import { ensureADFFormat } from "@features/jira/shared/parsers/adf.parser";

/**
 * Handler for updating existing JIRA issues
 * Provides comprehensive issue updates with validation, transitions, and rich responses
 * Uses the use-case pattern for separation of concerns
 */
export class UpdateIssueHandler extends BaseToolHandler<
  UpdateIssueParams,
  string
> {
  private readonly formatter: IssueUpdateFormatter;

  /**
   * Create a new UpdateIssueHandler with necessary dependencies
   *
   * @param updateIssueUseCase - Use case for updating issues with validation
   */
  constructor(private readonly updateIssueUseCase: UpdateIssueUseCase) {
    super("JIRA", "Update Issue");
    this.formatter = new IssueUpdateFormatter();
  }

  /**
   * Execute the handler logic
   * Updates an existing JIRA issue with comprehensive validation and formatting
   * Delegates business logic to the use case
   *
   * @param params - Parameters for issue update
   */
  protected async execute(params: UpdateIssueParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams = this.validateParameters(params);
      this.logger.info(`Updating JIRA issue: ${validatedParams.issueKey}`);

      // Step 2: Map parameters to use case request
      const useCaseRequest: UpdateIssueUseCaseRequest =
        this.mapToUseCaseRequest(validatedParams);

      // Step 3: Execute the use case
      this.logger.debug("Delegating to UpdateIssueUseCase", {
        issueKey: validatedParams.issueKey,
        hasTransition: !!validatedParams.transition,
        hasFieldUpdates: Object.keys(useCaseRequest.fields || {}).length > 0,
      });

      const updatedIssue =
        await this.updateIssueUseCase.execute(useCaseRequest);

      // Step 4: Format and return success response
      this.logger.info(`Successfully updated issue: ${updatedIssue.key}`);
      return this.formatter.format(updatedIssue);
    } catch (error) {
      this.logger.error(`Failed to update JIRA issue: ${error}`);
      throw this.enhanceError(error, params.issueKey);
    }
  }

  /**
   * Validate parameters using Zod schema
   */
  private validateParameters(params: UpdateIssueParams): UpdateIssueParams {
    const result = updateIssueParamsSchema.safeParse(params);

    if (!result.success) {
      const errorMessage = `Invalid issue update parameters: ${formatZodError(
        result.error,
      )}`;
      throw new IssueUpdateParamsValidationError(errorMessage);
    }

    return result.data;
  }

  /**
   * Map handler parameters to use case request
   * Transforms update parameters into use case format with proper field mapping
   */
  private mapToUseCaseRequest(
    params: UpdateIssueParams,
  ): UpdateIssueUseCaseRequest {
    const useCaseRequest: UpdateIssueUseCaseRequest = {
      issueKey: params.issueKey,
      notifyUsers: params.notifyUsers,
    };

    // Map basic fields
    this.mapBasicFields(params, useCaseRequest);

    // Map transition
    this.mapTransition(params, useCaseRequest);

    // Map array operations (labels and components)
    this.mapArrayOperations(params, useCaseRequest);

    return useCaseRequest;
  }

  /**
   * Map basic issue fields (summary, description, priority, assignee)
   */
  private mapBasicFields(
    params: UpdateIssueParams,
    useCaseRequest: UpdateIssueUseCaseRequest,
  ): void {
    if (
      params.summary ||
      params.description ||
      params.priority ||
      params.assignee
    ) {
      useCaseRequest.fields = {};

      if (params.summary) {
        useCaseRequest.fields.summary = params.summary;
      }

      if (params.description) {
        // Convert description to ADF format
        const adfDescription = ensureADFFormat(params.description);
        if (adfDescription) {
          useCaseRequest.fields.description = adfDescription;
        }
      }

      if (params.priority) {
        useCaseRequest.fields.priority = { name: params.priority };
      }

      if (params.assignee) {
        useCaseRequest.fields.assignee = { accountId: params.assignee };
      }
    }
  }

  /**
   * Map transition information
   */
  private mapTransition(
    params: UpdateIssueParams,
    useCaseRequest: UpdateIssueUseCaseRequest,
  ): void {
    if (params.transition) {
      useCaseRequest.transition = {
        id: params.transition.id,
        fields: params.transition.fields,
      };
    }
  }

  /**
   * Map array operations for labels and components
   */
  private mapArrayOperations(
    params: UpdateIssueParams,
    useCaseRequest: UpdateIssueUseCaseRequest,
  ): void {
    if (params.labels || params.components) {
      useCaseRequest.fields = useCaseRequest.fields || {};

      this.mapLabelsOperation(params, useCaseRequest);
      this.mapComponentsOperation(params, useCaseRequest);
    }
  }

  /**
   * Map labels operation
   */
  private mapLabelsOperation(
    params: UpdateIssueParams,
    useCaseRequest: UpdateIssueUseCaseRequest,
  ): void {
    if (
      params.labels &&
      params.labels.operation === "set" &&
      useCaseRequest.fields
    ) {
      useCaseRequest.fields.labels = params.labels.values;
    }
  }

  /**
   * Map components operation
   */
  private mapComponentsOperation(
    params: UpdateIssueParams,
    useCaseRequest: UpdateIssueUseCaseRequest,
  ): void {
    if (
      params.components &&
      params.components.operation === "set" &&
      useCaseRequest.fields
    ) {
      useCaseRequest.fields.components = params.components.values.map(
        (name) => ({ name }),
      );
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown, issueKey?: string): Error {
    const issueContext = issueKey ? ` for issue '${issueKey}'` : "";

    if (error instanceof JiraNotFoundError) {
      return new Error(
        `❌ **Issue Not Found**\n\nIssue '${issueKey}' was not found${issueContext}.\n\n**Solutions:**\n- Verify the issue key is correct (format: PROJECT-123)\n- Check if the issue exists in your JIRA instance\n- Ensure you have permission to view the issue\n\n**Example:** \`jira_update_issue issueKey=PROJ-123 summary="Updated summary"\``,
      );
    }

    if (error instanceof JiraPermissionError) {
      return new Error(
        `❌ **Permission Denied**\n\nYou don't have permission to update issue '${issueKey}'.\n\n**Solutions:**\n- Check your JIRA permissions for this project\n- Contact your JIRA administrator\n- Verify you're assigned to the issue or have edit permissions\n\n**Required Permissions:** Edit Issues, Transition Issues (for status changes)`,
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your field values are valid for this issue type\n- Verify required fields are provided for transitions\n- Ensure array operations reference existing values\n\n**Example:** \`jira_update_issue issueKey=PROJ-123 summary="New summary" priority=High\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Update Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify the issue exists and is accessible\n- Ensure you have the necessary permissions\n\n**Example:** \`jira_update_issue issueKey=PROJ-123 summary="Updated summary"\``,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred during issue update.\n\nPlease check your parameters and try again.",
    );
  }
}
