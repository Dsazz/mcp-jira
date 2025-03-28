/**
 * JIRA HTTP Client Interfaces
 *
 * Contains interfaces for HTTP operations in the JIRA API
 */

/**
 * Options for HTTP requests to the JIRA API
 */
export interface HttpRequestOptions {
  /**
   * API endpoint path (relative to base URL)
   */
  endpoint: string;

  /**
   * HTTP method
   */
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

  /**
   * Optional query parameters
   */
  queryParams?: Record<string, string | number | boolean | undefined>;

  /**
   * Optional request body
   */
  body?: unknown;

  /**
   * Optional request headers
   */
  headers?: Record<string, string>;
}

/**
 * Generic HTTP client interface
 */
export interface HttpClient {
  /**
   * Send an HTTP request to the JIRA API
   * @param options - Request configuration
   * @returns Promise resolving to the response data
   */
  sendRequest<T>(options: HttpRequestOptions): Promise<T>;

  /**
   * Check if the client is configured properly
   * @returns true if the client is configured
   */
  isConfigured?(): boolean;
}
