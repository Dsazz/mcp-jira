/**
 * URL Builder Utility for JIRA API
 *
 * Handles URL construction with proper slash handling and query parameters
 */

/**
 * Utility class for building JIRA API URLs
 */
export class JiraUrlBuilder {
  private readonly baseUrl: string;

  /**
   * Create a new URL builder with the base URL
   *
   * @param hostUrl - The JIRA host URL
   */
  constructor(hostUrl: string) {
    this.baseUrl = this.buildBaseUrl(hostUrl);
  }

  /**
   * Build a complete URL for an API endpoint
   *
   * @param endpoint - The API endpoint path
   * @param queryParams - Optional query parameters
   * @returns The complete URL
   */
  public buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = this.buildEndpointUrl(endpoint);
    return this.appendQueryParams(url, queryParams);
  }

  /**
   * Get the base URL
   *
   * @returns The base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Build the base URL from host URL
   *
   * @param hostUrl - The JIRA host URL
   * @returns The base URL with proper formatting
   */
  private buildBaseUrl(hostUrl: string): string {
    const normalizedHostUrl = this.normalizeHostUrl(hostUrl);
    return `${normalizedHostUrl}rest/api/3`;
  }

  /**
   * Normalize host URL to ensure proper trailing slash
   *
   * @param hostUrl - The host URL to normalize
   * @returns Normalized host URL with trailing slash
   */
  private normalizeHostUrl(hostUrl: string): string {
    return hostUrl.endsWith("/") ? hostUrl : `${hostUrl}/`;
  }

  /**
   * Build URL for a specific endpoint
   *
   * @param endpoint - The API endpoint
   * @returns URL with endpoint appended
   */
  private buildEndpointUrl(endpoint: string): string {
    const cleanEndpoint = this.normalizeEndpoint(endpoint);
    const cleanBaseUrl = this.normalizeBaseUrl();
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Normalize endpoint to remove leading slashes
   *
   * @param endpoint - The endpoint to normalize
   * @returns Normalized endpoint without leading slashes
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.replace(/^\/+/, "");
  }

  /**
   * Normalize base URL to remove trailing slash
   *
   * @returns Base URL without trailing slash
   */
  private normalizeBaseUrl(): string {
    return this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
  }

  /**
   * Append query parameters to URL
   *
   * @param url - The base URL
   * @param queryParams - Query parameters to append
   * @returns URL with query parameters
   */
  private appendQueryParams(
    url: string,
    queryParams?: Record<string, string | number | boolean | undefined>,
  ): string {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return url;
    }

    const params = this.buildQueryParams(queryParams);
    const paramString = params.toString();

    return paramString ? `${url}?${paramString}` : url;
  }

  /**
   * Build URLSearchParams from query parameters object
   *
   * @param queryParams - Query parameters object
   * @returns URLSearchParams instance
   */
  private buildQueryParams(
    queryParams: Record<string, string | number | boolean | undefined>,
  ): URLSearchParams {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    }

    return params;
  }
}
