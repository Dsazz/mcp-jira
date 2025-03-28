/**
 * Get Issue Handler
 *
 * Handles retrieving a specific JIRA issue by key
 */
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@core/responses";
import { BaseToolHandler } from "@core/tools";
import { formatZodError } from "@core/utils/validation";
import type { JiraClient } from "../../api/jira.client.impl";
import { IssueFormatter } from "../../formatters/issue.formatter";
import { issueKeySchema } from "../utils/schemas";

/**
 * Parameters for getting a JIRA issue
 */
const getIssueParamsSchema = z.object({
  issueKey: issueKeySchema,
});

/**
 * Interface for the parameters required by GetIssueHandler
 */
export type GetIssueParams = z.infer<typeof getIssueParamsSchema>;

// List of fields to retrieve for each issue
const ISSUE_FIELDS = [
  "summary",
  "description",
  "status",
  "priority",
  "assignee",
  "reporter",
  "created",
  "updated",
  "labels",
];

/**
 * Handler for retrieving and formatting a specific JIRA issue
 */
export class GetIssueHandler extends BaseToolHandler<
  z.infer<typeof getIssueParamsSchema>,
  string
> {
  private formatter: IssueFormatter;

  /**
   * Create a new GetIssueHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Get Issue");
    this.formatter = new IssueFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves a JIRA issue by key and formats it using the formatter
   *
   * @param params - Parameters with the JIRA issue key
   */
  protected async execute(
    params: z.infer<typeof getIssueParamsSchema>,
  ): Promise<string> {
    try {
      const { issueKey } = params;

      this.logger.info(`Getting JIRA issue: ${issueKey}`);

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Get the issue with all necessary fields
      const issue = await this.client.getIssue(issueKey);

      // Format the issue using the formatter
      return this.formatter.format(issue);
    } catch (error) {
      this.logger.error(`Failed to get issue: ${error}`);
      throw error;
    }
  }

  /**
   * Handle the request for getting a JIRA issue
   *
   * @param params - Request parameters
   * @returns Response object with success/error status
   */
  async handler(params: unknown) {
    console.info(
      `[JIRA:Get Issue] Getting issue with key: ${
        typeof params === "object" && params !== null && "issueKey" in params
          ? String(params.issueKey)
          : "(none)"
      }`,
    );

    try {
      // Validate and parse parameters
      const result = getIssueParamsSchema.safeParse(params);
      if (!result.success) {
        const errorMessage = `Invalid issue parameters: ${formatZodError(
          result.error,
        )}`;
        throw new Error(errorMessage);
      }

      // Extract validated parameters
      const { issueKey } = result.data;

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Fetch issue from JIRA
      const issue = await this.client.getIssue(issueKey, ISSUE_FIELDS);

      // Format the issue for display using the formatter
      const formattedIssue = this.formatter.format(issue);

      // Return successful response
      return createSuccessResponse({
        formattedText: formattedIssue,
      });
    } catch (error) {
      console.error(
        `[JIRA:Get Issue] Failed to get issue: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      console.error(
        `[JIRA:Get Issue:${
          error instanceof Error ? error : String(error)
        }] Tool execution failed`,
      );

      return createErrorResponse(
        `Failed to get issue: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
