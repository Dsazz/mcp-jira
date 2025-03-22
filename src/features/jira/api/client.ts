/**
 * API client for JIRA REST API
 */
import { JiraConfig } from '../config/jira-config';
import { 
  Issue, 
  SearchResponse, 
  ApiError as ApiErrorType,
  CreateIssueResponse 
} from './types';
import { 
  ApiError, 
  NotFoundError, 
  AuthorizationError, 
  ServerError,
  RateLimitError,
  IssueError
} from '../errors/api-errors';
import { getLogger } from '../../../shared/logging';

export class ApiClient {
  private baseUrl: string;
  private authHeader: string;
  private logger = getLogger('JIRA API');

  constructor(config?: JiraConfig) {
    // Use provided config or create a new one
    const jiraConfig = config || new JiraConfig();
    
    if (!jiraConfig.isValid()) {
      this.logger.warn('Initializing API client with invalid configuration');
    }
    
    this.baseUrl = `${jiraConfig.host}/rest/api/2`;
    this.authHeader = `Basic ${Buffer.from(`${jiraConfig.username}:${jiraConfig.getApiToken()}`).toString('base64')}`;
  }

  /**
   * Send a request to the API
   */
  private async sendRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown,
    queryParams?: Record<string, string>
  ): Promise<T> {
    // Build URL with query parameters
    let url = `${this.baseUrl}/${endpoint}`;
    if (queryParams) {
      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      url = `${url}?${queryString}`;
    }

    try {
      this.logger.debug(`Sending ${method} request to ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': this.authHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      // Handle non-successful responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse response
      return await response.json() as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Convert unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error connecting to JIRA'
      );
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ApiErrorType;
    
    try {
      errorData = await response.json() as ApiErrorType;
    } catch (e) {
      // If we can't parse the response as JSON, create a basic error structure
      errorData = {
        errorMessages: [`${response.status} ${response.statusText}`],
        errors: {}
      };
    }
    
    // Create appropriate error based on status code
    const errorMessage = errorData.errorMessages?.join(', ') || 
      Object.values(errorData.errors || {}).join(', ') || 
      `JIRA API error: ${response.status} ${response.statusText}`;
    
    switch (response.status) {
      case 400:
        throw new ApiError(errorMessage, 400, 'BAD_REQUEST');
      case 401:
        throw new AuthorizationError(errorMessage);
      case 403:
        throw new AuthorizationError(`Permission denied: ${errorMessage}`);
      case 404:
        throw new NotFoundError(errorMessage);
      case 429:
        throw new RateLimitError(errorMessage);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(errorMessage);
      default:
        throw new ApiError(errorMessage, response.status);
    }
  }

  /**
   * Get a single issue by key
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<Issue> {
    const queryParams = fields ? { fields: fields.join(',') } : undefined;
    return this.sendRequest<Issue>(`issue/${issueKey}`, 'GET', undefined, queryParams);
  }

  /**
   * Search for issues using JQL
   */
  async searchIssues(
    jql: string, 
    fields?: string[], 
    maxResults: number = 50
  ): Promise<SearchResponse> {
    return this.sendRequest<SearchResponse>('search', 'POST', {
      jql,
      fields,
      maxResults
    });
  }

  /**
   * Get issues assigned to the current user
   */
  async getAssignedIssues(fields?: string[]): Promise<Issue[]> {
    const jql = 'assignee = currentUser() ORDER BY updated DESC';
    const response = await this.searchIssues(jql, fields);
    return response.issues;
  }

  /**
   * Create a new issue
   */
  async createIssue(
    projectKey: string,
    summary: string,
    issueType: string = 'Task',
    description?: string,
    additionalFields?: Record<string, unknown>
  ): Promise<CreateIssueResponse> {
    return this.sendRequest<CreateIssueResponse>('issue', 'POST', {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
        ...additionalFields
      }
    });
  }

  /**
   * Create a task from an existing issue
   */
  async createTaskFromIssue(issueKey: string): Promise<CreateIssueResponse> {
    // Get source issue first
    const sourceIssue = await this.getIssue(issueKey, ['summary', 'project']);
    
    // Check if the project field exists
    if (!sourceIssue.fields.project || !sourceIssue.fields.project.key) {
      throw new IssueError(
        `Issue ${issueKey} does not have a valid project field`,
        issueKey
      );
    }
    
    // Create new task
    return this.createIssue(
      sourceIssue.fields.project.key,
      `Task from ${issueKey}: ${sourceIssue.fields.summary}`,
      'Task',
      undefined,
      { parent: { key: issueKey } }
    );
  }
}

// Create a singleton instance
export const api = new ApiClient(); 