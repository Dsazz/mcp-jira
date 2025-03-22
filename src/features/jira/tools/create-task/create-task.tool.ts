/**
 * CreateTaskTool implementation
 * Creates a local task from a JIRA issue
 */
import { JiraTool } from '../jira-tool';
import { api } from '../../api/client';
import { IssueFormatter } from '../../formatters/issue.formatter';
import { createTaskParamsSchema } from './create-task.schema';
import { CreateTaskParams } from './create-task.types';
import { JiraConfig } from '../../config/jira-config';
import { validate } from '../../../../shared/validation/zod-validator';
/**
 * Tool for creating a local task from a JIRA issue
 */
export class CreateTaskTool extends JiraTool<CreateTaskParams, string> {
  private formatter: IssueFormatter;
  
  /**
   * Create a new CreateTaskTool with configuration
   */
  constructor(config: JiraConfig = new JiraConfig()) {
    super('Create Task', config);
    this.formatter = new IssueFormatter();
  }
  
  /**
   * Execute the tool logic
   * Creates a task from an issue
   */
  protected async execute(params: CreateTaskParams): Promise<string> {
    try {
      // Validate parameters
      const validParams = validate(createTaskParamsSchema, params, 'Invalid task parameters');
      
      this.logger.info(`Creating task from issue: ${validParams.issueKey}`);
      
      // Get issue details with relevant fields
      const fields = [
        'summary', 'description', 'status', 
        'priority', 'assignee'
      ];
      
      // Retrieve the issue
      const issue = await api.getIssue(validParams.issueKey, fields);
      
      // Create a task (mock implementation - replace with actual task creation)
      // TODO: Implement actual task creation logic
      
      // Return confirmation message with issue details
      const issueDetails = this.formatter.format(issue);
      return `Task created from issue ${validParams.issueKey}\n\n${issueDetails}`;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }
} 