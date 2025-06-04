/**
 * Response Handler Utility for JIRA API
 *
 * Handles HTTP response processing and parsing
 */

/**
 * Utility class for handling HTTP responses
 */
export class JiraResponseHandler {
  /**
   * Process and parse HTTP response
   *
   * @param response - The HTTP response
   * @returns Parsed response data
   * @throws Error if response processing fails
   */
  public async processResponse<T>(response: Response): Promise<T> {
    if (this.isNoContentResponse(response)) {
      return this.handleNoContentResponse<T>();
    }

    return this.parseJsonResponse<T>(response);
  }

  /**
   * Check if response has no content
   *
   * @param response - The HTTP response
   * @returns True if response has no content
   */
  private isNoContentResponse(response: Response): boolean {
    return response.status === 204;
  }

  /**
   * Handle no content response
   *
   * @returns Empty object for no content responses
   */
  private handleNoContentResponse<T>(): T {
    return {} as T;
  }

  /**
   * Parse JSON response
   *
   * @param response - The HTTP response
   * @returns Parsed JSON data
   * @throws Error if JSON parsing fails
   */
  private async parseJsonResponse<T>(response: Response): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
