/**
 * GetAssignedIssuesTool implementation
 * Retrieves all JIRA issues assigned to the current user
 */
import { JiraTool } from '../jira-tool';
import { IssueListFormatter } from '../../formatters/issue-list.formatter';
import { api } from '../../api/client';
import { JiraConfig } from '../../config/jira-config';

/**
 * Tool for retrieving and formatting assigned JIRA issues
 * Does not require any parameters
 */
export class GetAssignedIssuesTool extends JiraTool<Record<string, never>, string> {
  private formatter: IssueListFormatter;
  
  /**
   * Create a new GetAssignedIssuesTool with configuration
   */
  constructor(config: JiraConfig = new JiraConfig()) {
    super('Get Assigned Issues', config);
    this.formatter = new IssueListFormatter();
  }
  
  /**
   * Execute the tool logic
   * Retrieves assigned issues and formats them using the formatter
   */
  protected async execute(): Promise<string> {
    try {
      this.logger.info('Getting issues assigned to the current user');
      
      // Get assigned issues with relevant fields
      const fields = ['summary', 'status', 'priority', 'updated'];
      const issues = await api.getAssignedIssues(fields);
      
      // Handle empty results case
      if (issues.length === 0) {
        this.logger.info('No issues assigned to the current user');
        return 'No issues are currently assigned to you.';
      }
      
      // Format issues using the formatter
      return this.formatter.format(issues);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error));
    }
  }
} 