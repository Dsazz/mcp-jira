/**
 * JIRA configuration implementation
 */
import { FeatureConfig } from '../../../shared/config/feature-config.interface';

/**
 * Configuration for the JIRA feature
 * Implements the standard FeatureConfig interface
 */
export class JiraConfig implements FeatureConfig {
  /**
   * Feature name
   */
  readonly name = 'JIRA';
  
  /**
   * JIRA host URL
   */
  readonly host: string;
  
  /**
   * Username for JIRA authentication
   */
  readonly username: string;
  
  /**
   * API token for JIRA authentication (hidden from diagnostics)
   */
  private readonly apiToken: string;
  
  /**
   * Create a new JiraConfig
   */
  constructor() {
    try {
      this.host = process.env.JIRA_HOST || 'https://jira.example.com';
      this.username = process.env.JIRA_USERNAME || 'default-username';
      this.apiToken = process.env.JIRA_API_TOKEN || 'default-token';
    } catch (error) {
      this.host = '';
      this.username = '';
      this.apiToken = '';
    }
  }
  
  /**
   * Check if configuration is valid
   */
  isValid(): boolean {
    return Boolean(this.host && this.username && this.apiToken);
  }
  
  /**
   * Get API token - used by API clients
   */
  getApiToken(): string {
    return this.apiToken;
  }
  
  /**
   * Get diagnostic information
   * Note: does not include the API token for security
   */
  getDiagnostics(): Record<string, unknown> {
    return {
      host: this.host,
      username: this.username,
      hasApiToken: Boolean(this.apiToken),
      isValid: this.isValid()
    };
  }
} 