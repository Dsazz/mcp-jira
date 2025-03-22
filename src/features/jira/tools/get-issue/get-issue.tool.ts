/**
 * GetIssueTool implementation
 * Retrieves detailed information about a specific JIRA issue
 */
import { JiraTool } from '../jira-tool';
import { api } from '../../api/client';
import { IssueFormatter } from '../../formatters/issue.formatter';
import { getIssueParamsSchema } from './get-issue.schema';
import { GetIssueParams } from './get-issue.types';
import { JiraConfig } from '../../config/jira-config';
import { validate } from '../../../../shared/validation/zod-validator';
/**
 * Tool for retrieving and formatting a specific JIRA issue
 */
export class GetIssueTool extends JiraTool<GetIssueParams, string> {
  private formatter: IssueFormatter;
  
  /**
   * Create a new GetIssueTool with configuration
   */
  constructor(config: JiraConfig = new JiraConfig()) {
    super('Get Issue', config);
    this.formatter = new IssueFormatter();
  }
  
  /**
   * Execute the tool logic
   * Retrieves issue details and formats using the formatter
   */
  protected async execute(params: GetIssueParams): Promise<string> {
    try {
      // Validate parameters
      const validParams = validate(getIssueParamsSchema, params, 'Invalid issue parameters');
      
      this.logger.info(`Getting issue with key: ${validParams.issueKey}`);
      
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
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }
} 