/**
 * JIRA specific tool base class
 */
import { BaseTool } from '../../../shared/tools/base-tool';
import { JiraConfig } from '../config/jira-config';

/**
 * Base tool class for JIRA tools
 * Provides common functionality specific to JIRA feature
 */
export abstract class JiraTool<TParams = unknown, TResult = unknown> 
extends BaseTool<TParams, TResult> {
  /**
   * Create a new JiraTool
   */
  constructor(
    toolName: string,
    config: JiraConfig
  ) {
    super('JIRA', toolName, config);
  }
  
  /**
   * Get the typed JIRA configuration
   */
  protected getJiraConfig(): JiraConfig {
    return this.config as JiraConfig;
  }
  
  /**
   * Get JIRA host URL
   */
  protected getHost(): string {
    return this.getJiraConfig().host;
  }
  
  /**
   * Get JIRA username
   */
  protected getUsername(): string {
    return this.getJiraConfig().username;
  }
  
  /**
   * Get JIRA API token
   */
  protected getApiToken(): string {
    return this.getJiraConfig().getApiToken();
  }
} 