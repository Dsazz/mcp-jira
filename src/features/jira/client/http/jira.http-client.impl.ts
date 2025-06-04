import { NetworkErrorClassifier } from "@core/errors";
/**
 * JIRA HTTP Client Implementation
 *
 * Low-level HTTP client for JIRA API requests
 */
import { logger } from "@core/logging";
import type { JiraConfigService } from "../config/jira-config.service";
import {
  JiraApiError,
  JiraAuthenticationError,
  JiraNetworkError,
} from "../errors";
import { JiraHttpErrorHandler } from "./jira-http-error.handler";
import type { HttpClient, HttpRequestOptions } from "./jira.http.types";
import {
  JiraUrlBuilder,
  JiraRequestBuilder,
  JiraResponseHandler,
} from "./utils";

/**
 * HTTP client implementation for JIRA API
 */
export class JiraHttpClient implements HttpClient {
  private readonly config: ReturnType<JiraConfigService["get"]>;
  private readonly urlBuilder: JiraUrlBuilder;
  private readonly requestBuilder: JiraRequestBuilder;
  private readonly responseHandler: JiraResponseHandler;
  private readonly errorHandler: JiraHttpErrorHandler;
  private readonly networkClassifier: NetworkErrorClassifier;

  /**
   * Create a new JIRA HTTP client with validated configuration
   *
   * @param jiraConfig - Validated JIRA configuration object
   */
  constructor(jiraConfig: JiraConfigService) {
    // Get the validated configuration
    this.config = jiraConfig.get();

    // Initialize utility classes
    this.urlBuilder = new JiraUrlBuilder(this.config.hostUrl);
    this.requestBuilder = new JiraRequestBuilder({
      username: this.config.username,
      apiToken: this.config.apiToken,
    });
    this.responseHandler = new JiraResponseHandler();

    // Initialize error handling dependencies
    this.errorHandler = new JiraHttpErrorHandler();
    this.networkClassifier = new NetworkErrorClassifier("JIRA:HTTP");
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
    const url = this.urlBuilder.buildUrl(endpoint, queryParams);

    try {
      // Set up request parameters
      const requestParams = this.requestBuilder.createRequestParams(
        method,
        headers,
        body,
      );

      // Make the request
      logger.debug(`${method} ${url}`, { prefix: "JIRA:HTTP" });
      const response = await fetch(url, requestParams);

      // Handle HTTP errors
      if (!response.ok) {
        await this.errorHandler.handleErrorResponse(response);
      }

      // Parse and return the response
      return await this.responseHandler.processResponse<T>(response);
    } catch (error) {
      // Re-throw API errors
      if (
        error instanceof JiraApiError ||
        error instanceof JiraAuthenticationError
      ) {
        throw error;
      }

      // Handle network errors with JIRA-specific error type
      this.networkClassifier.classifyAndThrowNetworkError(
        error,
        JiraNetworkError,
      );
    }
  }

  /**
   * Get the base URL for testing purposes
   *
   * @returns The base URL
   */
  public getBaseUrl(): string {
    return this.urlBuilder.getBaseUrl();
  }
}
