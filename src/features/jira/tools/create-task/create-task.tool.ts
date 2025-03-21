/**
 * CreateTaskTool implementation
 * Creates a local task from a JIRA issue
 */
import { BaseTool } from '../base.tool';
import { ZodValidatable } from '../../validation/zod-validatable.mixin';
import { api } from '../../api/client';
import { IssueFormatter } from '../../formatters/issue.formatter';
import { logger } from '../../../../shared/logger';
import { createTaskParamsSchema } from './create-task.schema';
import { CreateTaskParams } from './create-task.types';

/**
 * Create a non-abstract base tool class to use with ZodValidatable mixin
 */
class CreateTaskBaseTool extends BaseTool<CreateTaskParams, string> {
  protected readonly toolName = 'Create Task';
  protected async execute(params: CreateTaskParams): Promise<string> {
    throw new Error('Method not implemented in base class');
  }
}

/**
 * Tool for creating a local task from a JIRA issue
 * Uses composition with a direct formatter instance
 */
export class CreateTaskTool extends ZodValidatable(CreateTaskBaseTool, createTaskParamsSchema) {
  private formatter: IssueFormatter;
  
  constructor() {
    super();
    // Create a direct instance of the formatter
    this.formatter = new IssueFormatter();
  }
  
  /**
   * Execute the tool logic
   * Creates a task from an issue
   */
  protected async execute(params: CreateTaskParams): Promise<string> {
    // Validate parameters
    const validParams = this.validateParams(params);
    
    // Log
    logger.info(`Creating task from issue: ${validParams.issueKey}`, {
      prefix: `JIRA ${this.toolName}`,
      isMcp: true
    });
    
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
  }
} 