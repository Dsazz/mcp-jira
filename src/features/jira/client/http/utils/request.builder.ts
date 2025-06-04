/**
 * Request Builder Utility for JIRA API
 *
 * Handles HTTP request parameter construction including authentication and headers
 */

/**
 * Configuration interface for request builder
 */
export interface RequestBuilderConfig {
  username: string;
  apiToken: string;
}

/**
 * Utility class for building HTTP request parameters
 */
export class JiraRequestBuilder {
  private readonly config: RequestBuilderConfig;

  /**
   * Create a new request builder with configuration
   *
   * @param config - Request builder configuration
   */
  constructor(config: RequestBuilderConfig) {
    this.config = config;
  }

  /**
   * Create request parameters for the fetch API
   *
   * @param method - HTTP method
   * @param headers - Additional headers
   * @param body - Request body
   * @returns The request parameters
   */
  public createRequestParams(
    method: string,
    headers: Record<string, string> = {},
    body?: unknown,
  ): RequestInit {
    const authHeaders = this.createAuthHeaders();
    const defaultHeaders = this.createDefaultHeaders();
    const combinedHeaders = this.combineHeaders(
      defaultHeaders,
      authHeaders,
      headers,
    );

    return {
      method,
      headers: combinedHeaders,
      body: this.serializeBody(body),
    };
  }

  /**
   * Create authentication headers
   *
   * @returns Authentication headers
   */
  private createAuthHeaders(): Record<string, string> {
    const auth = this.createBasicAuthToken();
    return {
      Authorization: `Basic ${auth}`,
    };
  }

  /**
   * Create basic authentication token
   *
   * @returns Base64 encoded authentication token
   */
  private createBasicAuthToken(): string {
    const credentials = `${this.config.username}:${this.config.apiToken}`;
    return Buffer.from(credentials).toString("base64");
  }

  /**
   * Create default headers for JIRA API requests
   *
   * @returns Default headers
   */
  private createDefaultHeaders(): Record<string, string> {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Combine multiple header objects
   *
   * @param headerSets - Header objects to combine
   * @returns Combined headers
   */
  private combineHeaders(
    ...headerSets: Record<string, string>[]
  ): Record<string, string> {
    return Object.assign({}, ...headerSets);
  }

  /**
   * Serialize request body to JSON string
   *
   * @param body - Request body to serialize
   * @returns Serialized body or undefined
   */
  private serializeBody(body?: unknown): string | undefined {
    return body !== undefined ? JSON.stringify(body) : undefined;
  }
}
