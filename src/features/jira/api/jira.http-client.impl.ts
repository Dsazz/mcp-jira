/**
 * JIRA HTTP Client Implementation
 *
 * Low-level HTTP client for JIRA API requests
 */
import { logger } from "@core/logging";
import type { JiraConfig } from "./jira.config.types";
import {
  JiraApiError,
  JiraAuthenticationError,
  type JiraErrorResponse,
  JiraNetworkError,
} from "./jira.errors";
import type { HttpClient, HttpRequestOptions } from "./jira.http.types";

/**
 * HTTP client implementation for JIRA API
 */
export class JiraHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly config: ReturnType<JiraConfig["get"]>;

  /**
   * Create a new JIRA HTTP client with validated configuration
   *
   * @param jiraConfig - Validated JIRA configuration object
   */
  constructor(jiraConfig: JiraConfig) {
    // Get the validated configuration
    this.config = jiraConfig.get();
    this.baseUrl = `${this.config.hostUrl}rest/api/3`;
  }

  /**
   * Send a request to the JIRA API
   *
   * @param options - Request options
   * @returns Promise resolving to the response data
   * @throws ApiError if the request fails
   */
  public async sendRequest<T>(options: HttpRequestOptions): Promise<T> {
    const { endpoint, method, queryParams, body, headers = {} } = options;
    const url = this.buildUrl(endpoint, queryParams);

    try {
      // Set up request parameters
      const requestParams = this.createRequestParams(method, headers, body);

      // Make the request
      logger.debug(`${method} ${url}`, { prefix: "JIRA:HTTP" });
      const response = await fetch(url, requestParams);

      // Handle HTTP errors
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse and return the response
      if (response.status === 204) {
        // No content response
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      // Re-throw API errors
      if (
        error instanceof JiraApiError ||
        error instanceof JiraAuthenticationError
      ) {
        throw error;
      }

      // Convert other errors to JiraNetworkError
      logger.error(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
        {
          prefix: "JIRA:HTTP",
        },
      );

      throw new JiraNetworkError(
        `Network error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Build a complete URL for a request
   *
   * @param endpoint - The API endpoint
   * @param queryParams - Optional query parameters
   * @returns The complete URL
   */
  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | undefined>,
  ): string {
    let url = `${this.baseUrl}/${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();

      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }

      const paramString = params.toString();
      if (paramString) {
        url += `?${paramString}`;
      }
    }

    return url;
  }

  /**
   * Create request parameters for the fetch API
   *
   * @param method - HTTP method
   * @param headers - Additional headers
   * @param body - Request body
   * @returns The request parameters
   */
  private createRequestParams(
    method: string,
    headers: Record<string, string>,
    body?: unknown,
  ): RequestInit {
    // Create authentication header
    const auth = Buffer.from(
      `${this.config.username}:${this.config.apiToken}`,
    ).toString("base64");

    // Combine headers
    const combinedHeaders = {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers,
    };

    // Create request parameters
    return {
      method,
      headers: combinedHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };
  }

  /**
   * Handle error responses from the JIRA API
   *
   * @param response - The HTTP response
   * @throws ApiError - The appropriate error type based on the response
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: JiraErrorResponse;
    try {
      errorData = (await response.json()) as JiraErrorResponse;
    } catch (_e) {
      errorData = {
        errorMessages: [response.statusText || "Unknown error"],
        errors: {},
      };
    }

    const errorMessage = errorData.errorMessages?.[0] || "Unknown error";

    // Handle different HTTP status codes
    switch (response.status) {
      case 401:
        throw new JiraAuthenticationError(
          errorMessage || `Authentication failed: ${response.statusText}`,
          response.status,
          errorData,
        );
      default:
        throw new JiraApiError(
          errorMessage || `API error: ${response.statusText}`,
          response.status,
          errorData,
        );
    }
  }
}
