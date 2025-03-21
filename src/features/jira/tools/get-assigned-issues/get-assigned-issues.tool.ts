/**
 * GetAssignedIssuesTool implementation
 * Retrieves all JIRA issues assigned to the current user
 */
import { BaseTool } from '../base.tool';
import { IssueListFormatter } from '../../formatters/issue-list.formatter';
import { api } from '../../api/client';
import { logger } from '../../../../shared/logger';

/**
 * Tool for retrieving and formatting assigned JIRA issues
 * Uses composition with a direct formatter instance
 * Does not require any parameters
 */
export class GetAssignedIssuesTool extends BaseTool<Record<string, never>, string> {
  protected readonly toolName = 'Get Assigned Issues';
  private formatter: IssueListFormatter;
  
  constructor() {
    super();
    // Create a direct instance of the formatter
    this.formatter = new IssueListFormatter();
  }
  
  /**
   * Execute the tool logic
   * Retrieves assigned issues and formats them using the formatter
   */
  protected async execute(): Promise<string> {
    // Log
    logger.info('Getting issues assigned to the current user', {
      prefix: `JIRA ${this.toolName}`,
      isMcp: true
    });
    
    // Get assigned issues with relevant fields
    const fields = ['summary', 'status', 'priority', 'updated'];
    const issues = await api.getAssignedIssues(fields);
    
    // Handle empty results case
    if (issues.length === 0) {
      logger.info('No issues assigned to the current user', {
        prefix: `JIRA ${this.toolName}`,
        isMcp: true
      });
      
      return 'No issues are currently assigned to you.';
    }
    
    // Format issues using the formatter
    return this.formatter.format(issues);
  }
} 