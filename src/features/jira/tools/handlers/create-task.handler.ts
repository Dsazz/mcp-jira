/**
 * Create Task Handler
 *
 * Handles creating a local task from a JIRA issue
 */
import { z } from "zod";
import { BaseToolHandler } from "@core/tools";
import { validate } from "@core/utils/validation";
import type { JiraClient } from "../../api/jira.client.impl";
import type { Issue } from "../../api/jira.models.types";
import { issueKeySchema } from "../utils/schemas";

/**
 * Parameters for creating a local task
 */
const createTaskParamsSchema = z.object({
  issueKey: issueKeySchema,
});

/**
 * Handler for creating a local task from a JIRA issue
 */
export class CreateTaskHandler extends BaseToolHandler<
  z.infer<typeof createTaskParamsSchema>,
  string
> {
  /**
   * Create a new CreateTaskHandler with client
   *
   * @param client - JIRA API client to use for requests
   */
  constructor(private readonly client?: JiraClient) {
    super("JIRA", "Create Task");
  }

  /**
   * Execute the handler logic
   * Creates a local task from a JIRA issue identified by key
   *
   * @param params - Parameters with the JIRA issue key
   */
  protected async execute(
    params: z.infer<typeof createTaskParamsSchema>,
  ): Promise<string> {
    try {
      const { issueKey } = validate(createTaskParamsSchema, params);

      this.logger.info(`Creating task from JIRA issue: ${issueKey}`);

      // Ensure client is available
      if (!this.client) {
        throw new Error("JIRA client not initialized");
      }

      // Get the issue details
      const issue = await this.client.getIssue(issueKey);

      // Create a local task (implementation specific to your system)
      // This is a placeholder for the actual task creation logic
      const taskId = await this.createLocalTask(issue);

      return `Successfully created task #${taskId} from JIRA issue ${issueKey}`;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error}`);
      throw error;
    }
  }

  /**
   * Creates a local task from a JIRA issue
   * Implementation would depend on your local task system
   *
   * @param issue - The JIRA issue details
   * @returns The ID of the created task
   */
  private async createLocalTask(issue: Issue): Promise<string> {
    // Placeholder implementation
    // In a real implementation, this would interact with your local task system
    return `TASK-${issue.id}`;
  }
}
