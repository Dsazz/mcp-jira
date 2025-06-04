/**
 * Generic HTTP Error Handler
 *
 * Provides base functionality for handling HTTP error responses
 * Can be extended by specific API implementations
 */
import { logger } from "@core/logging";
import { HttpError } from "./http.error";

/**
 * Generic error response interface
 */
export interface ErrorResponse {
  errorMessages?: string[];
  errors?: Record<string, unknown>;
  message?: string;
}

/**
 * Base HTTP error handler that can be extended for specific APIs
 */
export abstract class BaseHttpErrorHandler {
  /**
   * Handle error responses from HTTP APIs
   *
   * @param response - The HTTP response
   * @throws HttpError or specific error type
   */
  async handleErrorResponse(response: Response): Promise<never> {
    const errorData = await this.parseErrorData(response);
    const errorMessage = this.extractErrorMessage(errorData, response);

    this.throwAppropriateError(response.status, errorMessage, errorData);
  }

  /**
   * Parse error data from response, with fallback for invalid JSON
   */
  protected async parseErrorData(response: Response): Promise<ErrorResponse> {
    try {
      return (await response.json()) as ErrorResponse;
    } catch (_e) {
      // Provide fallback error data when JSON parsing fails
      const statusText = response.statusText || `HTTP ${response.status}`;
      return {
        errorMessages: [statusText],
        errors: {},
      };
    }
  }

  /**
   * Extract error message with proper fallbacks
   */
  protected extractErrorMessage(
    errorData: ErrorResponse,
    response: Response,
  ): string {
    return (
      errorData.errorMessages?.[0] ||
      errorData.message ||
      response.statusText ||
      `HTTP ${response.status} error`
    );
  }

  /**
   * Throw the appropriate error type based on HTTP status code
   * Override this method in specific implementations for custom error types
   */
  protected throwAppropriateError(
    status: number,
    errorMessage: string,
    errorData: ErrorResponse,
  ): never {
    // Default implementation throws generic HttpError
    throw new HttpError(errorMessage, status, { errorData });
  }

  /**
   * Log error for debugging purposes
   */
  protected logError(message: string, context?: Record<string, unknown>): void {
    logger.error(message, { prefix: "HTTP", ...context });
  }
}
