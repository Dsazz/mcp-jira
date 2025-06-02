/**
 * Get Sprints Handler
 *
 * Handles requests to retrieve JIRA sprints for a specific board with filtering
 */

import { logger } from "@core/logging";
import { BaseToolHandler } from "@core/tools";
import type { JiraApiClient } from "@features/jira/api/jira.client.types";
import {
  JiraApiError,
  JiraNotFoundError,
  JiraPermissionError,
} from "@features/jira/api/jira.errors";
import type { GetSprintsParams } from "@features/jira/api/jira.schemas";
import { formatSprintList } from "@features/jira/formatters/sprint-list.formatter";

/**
 * Handler for getting JIRA sprints
 */
export class GetSprintsHandler extends BaseToolHandler<GetSprintsParams> {
  constructor(private readonly jiraClient: JiraApiClient) {
    super("JIRA", "Get Sprints");
  }

  /**
   * Execute the get sprints operation
   */
  async execute(params: GetSprintsParams): Promise<string> {
    const startTime = Date.now();

    logger.info("Getting JIRA sprints", {
      prefix: "JIRA:GetSprints",
      params: {
        boardId: params.boardId,
        state: params.state,
        maxResults: params.maxResults,
        startAt: params.startAt,
      },
    });

    try {
      // Build options for the API call
      const options = this.buildApiOptions(params);

      // Get sprints from JIRA
      const sprints = await this.jiraClient.getSprints(params.boardId, options);

      const duration = Date.now() - startTime;
      logger.info(
        `Successfully retrieved ${sprints.length} sprints for board ${params.boardId}`,
        {
          prefix: "JIRA:GetSprints",
          duration,
          count: sprints.length,
          boardId: params.boardId,
        },
      );

      // Format and return the response
      return formatSprintList(sprints, params.boardId, {
        state: params.state,
        boardId: params.boardId,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Failed to get sprints", {
        prefix: "JIRA:GetSprints",
        duration,
        boardId: params.boardId,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.handleError(error, params);
    }
  }

  /**
   * Build API options from parameters
   */
  private buildApiOptions(params: GetSprintsParams) {
    const options: Record<string, unknown> = {};

    if (params.startAt !== undefined) {
      options.startAt = params.startAt;
    }

    if (params.maxResults !== undefined) {
      options.maxResults = params.maxResults;
    }

    if (params.state) {
      options.state = params.state;
    }

    return options;
  }

  /**
   * Handle errors with appropriate user-friendly messages
   */
  private handleError(error: unknown, params: GetSprintsParams): string {
    if (error instanceof JiraPermissionError) {
      return this.formatPermissionError(params);
    }

    if (error instanceof JiraNotFoundError) {
      return this.formatNotFoundError(params);
    }

    if (error instanceof JiraApiError) {
      return this.formatApiError(error, params);
    }

    // Generic error
    return this.formatGenericError(error, params);
  }

  /**
   * Format permission error response
   */
  private formatPermissionError(params: GetSprintsParams): string {
    const sections: string[] = [];

    sections.push("# ❌ Permission Error");
    sections.push(
      `You don't have permission to view sprints for board ${params.boardId}.`,
    );

    sections.push("## 💡 Suggestions");
    sections.push("• Contact your JIRA administrator to request board access");
    sections.push("• Use `jira_get_boards` to see boards you have access to");
    sections.push("• Check if you're logged into the correct JIRA instance");
    sections.push("• Verify your account has the necessary permissions");
    sections.push("• Ensure the board ID is correct and you have access to it");

    return sections.join("\n\n");
  }

  /**
   * Format not found error response
   */
  private formatNotFoundError(params: GetSprintsParams): string {
    const sections: string[] = [];

    sections.push("# ❌ Not Found");
    sections.push(
      `Board ${params.boardId} could not be found or has no sprints.`,
    );

    if (params.state) {
      sections.push(`**Applied filter:** state: ${params.state}`);
    }

    sections.push("## 💡 Suggestions");
    sections.push("• Verify the board ID is correct");
    sections.push("• Use `jira_get_boards` to find valid board IDs");
    sections.push("• Check if the board has any sprints created");
    sections.push("• Try removing the state filter to see all sprints");
    sections.push(
      "• Contact your JIRA administrator if you expect to see sprints",
    );

    return sections.join("\n\n");
  }

  /**
   * Format API error response
   */
  private formatApiError(
    error: JiraApiError,
    params: GetSprintsParams,
  ): string {
    const sections: string[] = [];

    sections.push("# ❌ JIRA API Error");
    sections.push(`**Error:** ${error.message}`);
    sections.push(`**Board ID:** ${params.boardId}`);

    if (error.statusCode) {
      sections.push(`**Status Code:** ${error.statusCode}`);
    }

    if (params.state) {
      sections.push(`**Applied filter:** state: ${params.state}`);
    }

    sections.push("## 💡 Suggestions");
    sections.push("• Check your JIRA connection and credentials");
    sections.push("• Verify the board ID is valid and accessible");
    sections.push("• Try with a different board ID");
    sections.push("• Contact your JIRA administrator if the problem persists");

    return sections.join("\n\n");
  }

  /**
   * Format generic error response
   */
  private formatGenericError(error: unknown, params: GetSprintsParams): string {
    const sections: string[] = [];

    sections.push("# ❌ Unexpected Error");
    sections.push("An unexpected error occurred while retrieving sprints.");
    sections.push(
      `**Error:** ${error instanceof Error ? error.message : String(error)}`,
    );
    sections.push(`**Board ID:** ${params.boardId}`);

    if (params.state) {
      sections.push(`**Applied filter:** state: ${params.state}`);
    }

    sections.push("## 💡 Suggestions");
    sections.push("• Try the request again in a few moments");
    sections.push("• Check your internet connection");
    sections.push("• Verify your JIRA instance is accessible");
    sections.push("• Try with a different board ID");
    sections.push("• Contact support if the problem persists");

    return sections.join("\n\n");
  }
}
