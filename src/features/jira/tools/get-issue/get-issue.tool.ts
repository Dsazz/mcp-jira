/**
 * GetIssueTool implementation
 * Retrieves detailed information about a specific JIRA issue
 */
import { BaseTool } from '../base.tool';
import { ZodValidatable } from '../../validation/zod-validatable.mixin';
import { api } from '../../api/client';
import { IssueFormatter } from '../../formatters/issue.formatter';
import { logger } from '../../../../shared/logger';
import { getIssueParamsSchema } from './get-issue.schema';
import { GetIssueParams } from './get-issue.types';

/**
 * Create a non-abstract base tool class to use with ZodValidatable mixin
 */
class GetIssueBaseTool extends BaseTool<GetIssueParams, string> {
  protected readonly toolName = 'Get Issue';
  protected async execute(params: GetIssueParams): Promise<string> {
    throw new Error('Method not implemented in base class');
  }
}

/**
 * Tool for retrieving and formatting a specific JIRA issue
 * Uses composition with a direct formatter instance 
 */
export class GetIssueTool extends ZodValidatable(GetIssueBaseTool, getIssueParamsSchema) {
  private formatter: IssueFormatter;
  
  constructor() {
    super();
    // Create a direct instance of the formatter
    this.formatter = new IssueFormatter();
  }
  
  /**
   * Execute the tool logic
   * Retrieves issue details and formats using the formatter
   */
  protected async execute(params: GetIssueParams): Promise<string> {
    // Validate parameters
    const validParams = this.validateParams(params);
    
    // Log
    logger.info(`Getting issue with key: ${validParams.issueKey}`, {
      prefix: `JIRA ${this.toolName}`,
      isMcp: true
    });
    
    // Get issue details with relevant fields
    const fields = [
      'summary', 'description', 'status', 
      'priority', 'assignee', 'created', 
      'updated', 'labels'
    ];
    
    // Retrieve the issue
    const issue = await api.getIssue(validParams.issueKey, fields);
    
    // Format issue using the formatter
    return this.formatter.format(issue);
  }
} 