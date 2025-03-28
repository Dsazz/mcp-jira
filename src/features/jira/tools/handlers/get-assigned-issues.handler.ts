/**
 * Get Assigned Issues Handler
 *
 * Handles retrieving all JIRA issues assigned to the current user
 */
import { BaseToolHandler } from "@core/tools";
import type { JiraClient } from "../../api/jira.client.impl";
import { IssueListFormatter } from "../../formatters/issue-list.formatter";

/**
 * Handler for retrieving and formatting assigned JIRA issues
 * Does not require any parameters
 */
export class GetAssignedIssuesHandler extends BaseToolHandler<
  Record<string, never>,
  string
> {
  private formatter: IssueListFormatter;

  /**
   * Create a new GetAssignedIssuesHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Get Assigned Issues");
    this.formatter = new IssueListFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves assigned issues and formats them using the formatter
   */
  protected async execute(): Promise<string> {
    try {
      this.logger.info("Getting issues assigned to the current user");

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Get assigned issues with relevant fields
      const fields = ["summary", "status", "priority", "updated"];
      const issues = await this.client.getAssignedIssues(fields);

      // Handle empty results case
      if (issues.length === 0) {
        this.logger.info("No issues assigned to the current user");
        return "No issues are currently assigned to you.";
      }

      // Format issues using the formatter
      return this.formatter.format(issues);
    } catch (error) {
      this.logger.error(`Failed to get assigned issues: ${error}`);
      throw error;
    }
  }
}
