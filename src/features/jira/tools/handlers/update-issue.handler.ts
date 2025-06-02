/**
 * Update Issue Handler
 *
 * Handles updating existing JIRA issues with comprehensive validation,
 * status transitions, array operations, and professional error handling
 */
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import type { JiraClient } from "@features/jira/api/jira.client.impl";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/api/jira.errors";
import {
  type UpdateIssueParams,
  transformToUpdateRequest,
  updateIssueParamsSchema,
} from "@features/jira/api/jira.schemas";
import { IssueUpdateFormatter } from "../../formatters/issue-update.formatter";

/**
 * Handler for updating existing JIRA issues
 * Provides comprehensive issue updates with validation, transitions, and rich responses
 */
export class UpdateIssueHandler extends BaseToolHandler<
  UpdateIssueParams,
  string
> {
  private readonly formatter: IssueUpdateFormatter;

  /**
   * Create a new UpdateIssueHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Update Issue");
    this.formatter = new IssueUpdateFormatter();
  }

  /**
   * Execute the handler logic
   * Updates an existing JIRA issue with comprehensive validation and formatting
   *
   * @param params - Parameters for issue update
   */
  protected async execute(params: UpdateIssueParams): Promise<string> {
    try {
      // Step 1: Validate parameters
      const validatedParams = this.validateParameters(params);
      this.logger.info(`Updating JIRA issue: ${validatedParams.issueKey}`);

      // Step 2: Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Step 3: Handle status transition if specified
      let transitionId: string | undefined;
      if (validatedParams.status) {
        transitionId = await this.resolveStatusTransition(
          validatedParams.issueKey,
          validatedParams.status,
        );
      }

      // Step 4: Transform parameters to API request
      const updateRequest = transformToUpdateRequest(validatedParams);

      // Step 5: Add transition if resolved
      if (transitionId) {
        updateRequest.transition = { id: transitionId };
      }

      // Step 6: Update the issue
      this.logger.debug("Updating issue with data:", {
        issueKey: validatedParams.issueKey,
        hasFields: !!updateRequest.fields,
        hasUpdates: !!updateRequest.update,
        hasTransition: !!updateRequest.transition,
      });

      const updatedIssue = await this.client.updateIssue(
        validatedParams.issueKey,
        updateRequest,
      );

      // Step 7: Handle worklog if specified
      if (validatedParams.worklog) {
        await this.addWorklogEntry(
          validatedParams.issueKey,
          validatedParams.worklog,
        );
      }

      // Step 8: Format and return success response
      this.logger.info(`Successfully updated issue: ${updatedIssue.key}`);
      return this.formatter.format(updatedIssue, {
        hasTransition: !!transitionId,
        hasWorklog: !!validatedParams.worklog,
        fieldsUpdated: Object.keys(updateRequest.fields || {}),
        arraysUpdated: Object.keys(updateRequest.update || {}),
      });
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
      throw new JiraApiError(errorMessage, 400);
    }

    return result.data;
  }

  /**
   * Resolve status name to transition ID
   */
  private async resolveStatusTransition(
    issueKey: string,
    targetStatus: string,
  ): Promise<string> {
    if (!this.client) {
      throw new Error("JIRA client not initialized");
    }

    this.logger.debug(`Resolving transition for status: ${targetStatus}`);

    try {
      const transitions = await this.client.getIssueTransitions(issueKey);

      // Find transition that leads to the target status
      const matchingTransition = transitions.find(
        (transition) =>
          transition.to.name.toLowerCase() === targetStatus.toLowerCase() ||
          transition.name.toLowerCase() === targetStatus.toLowerCase(),
      );

      if (!matchingTransition) {
        const availableStatuses = transitions.map((t) => t.to.name).join(", ");
        throw new JiraApiError(
          `Status '${targetStatus}' is not available for issue ${issueKey}. Available transitions: ${availableStatuses}`,
          400,
        );
      }

      this.logger.debug(
        `Found transition: ${matchingTransition.name} (${matchingTransition.id})`,
      );
      return matchingTransition.id;
    } catch (error) {
      if (error instanceof JiraApiError) {
        throw error;
      }
      throw new JiraApiError(
        `Failed to resolve status transition for '${targetStatus}': ${error}`,
        500,
      );
    }
  }

  /**
   * Add worklog entry to the issue
   */
  private async addWorklogEntry(
    issueKey: string,
    worklog: { timeSpent: string; comment?: string; started?: string },
  ): Promise<void> {
    if (!this.client) {
      throw new Error("JIRA client not initialized");
    }

    this.logger.debug(`Adding worklog to issue: ${issueKey}`);

    try {
      await this.client.addWorklog(
        issueKey,
        worklog.timeSpent,
        worklog.comment,
        worklog.started,
      );
      this.logger.debug(`Successfully added worklog: ${worklog.timeSpent}`);
    } catch (error) {
      this.logger.warn(`Failed to add worklog: ${error}`);
      // Don't fail the entire update if worklog fails
      throw new JiraApiError(
        `Issue updated successfully, but failed to add worklog: ${error}`,
        207, // Multi-status
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
      if (error.statusCode === 207) {
        // Multi-status error (partial success)
        return new Error(
          `⚠️ **Partial Update Success**\n\n${error.message}\n\n**Note:** The main issue update was successful, but there was an issue with additional operations.`,
        );
      }

      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your field values are valid for this issue type\n- Verify required fields are provided for transitions\n- Ensure array operations reference existing values\n- Check time format for worklog entries (e.g., '2h', '30m', '1d 4h')\n\n**Example:** \`jira_update_issue issueKey=PROJ-123 summary="New summary" priority=High\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **Update Failed**\n\n${error.message}${issueContext}\n\n**Solutions:**\n- Check your parameters are valid\n- Verify the issue exists and you have permissions\n- Try updating fewer fields at once\n\n**Example:** \`jira_update_issue issueKey=PROJ-123 description="Updated description"\``,
      );
    }

    return new Error(
      `❌ **Unknown Error**\n\nAn unknown error occurred during issue update${issueContext}.\n\nPlease check your parameters and try again.`,
    );
  }

  /**
   * Get the schema for this handler
   */
  static getSchema() {
    return updateIssueParamsSchema;
  }
}
