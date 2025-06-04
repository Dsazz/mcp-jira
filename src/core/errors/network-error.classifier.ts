/**
 * Generic Network Error Classifier
 *
 * Classifies and provides specific error messages for network errors
 * Generic implementation that can be used by any HTTP client
 */
import { logger } from "@core/logging";
import { HttpError } from "./http.error";

/**
 * Classifies network errors and provides appropriate error messages
 */
export class NetworkErrorClassifier {
  private readonly logPrefix: string;

  constructor(logPrefix = "HTTP") {
    this.logPrefix = logPrefix;
  }

  /**
   * Classify a network error and throw appropriate HttpError
   *
   * @param error - The caught error from network request
   * @param customErrorClass - Optional custom error class to throw instead of HttpError
   * @throws HttpError or custom error with specific message based on error type
   */
  classifyAndThrowNetworkError(
    error: unknown,
    customErrorClass?: new (message: string) => Error,
  ): never {
    this.logNetworkError(error);
    const networkErrorMessage = this.classifyErrorMessage(error);

    if (customErrorClass) {
      throw new customErrorClass(networkErrorMessage);
    }

    throw new HttpError(networkErrorMessage, 0, { originalError: error });
  }

  /**
   * Classify error and return specific error message without throwing
   */
  classifyErrorMessage(error: unknown): string {
    if (error instanceof TypeError) {
      return this.classifyTypeError(error);
    }

    if (error instanceof Error) {
      return this.classifyGenericError(error);
    }

    return `Network error: ${String(error)}`;
  }

  /**
   * Log the network error for debugging
   */
  private logNetworkError(error: unknown): void {
    logger.error(
      `Network error: ${error instanceof Error ? error.message : String(error)}`,
      {
        prefix: this.logPrefix,
      },
    );
  }

  /**
   * Classify TypeError instances (usually fetch-related)
   */
  private classifyTypeError(error: TypeError): string {
    if (error.message.includes("fetch")) {
      return "Unable to connect. Is the computer able to access the URL?";
    }
    return `Network connection failed: ${error.message}`;
  }

  /**
   * Classify generic Error instances by message patterns
   */
  private classifyGenericError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("timeout")) {
      return `Request timeout: ${error.message}`;
    }

    if (message.includes("network") || message.includes("dns")) {
      return `Network error: ${error.message}`;
    }

    if (message.includes("refused") || message.includes("connect")) {
      return `Connection refused: ${error.message}`;
    }

    return `Network request failed: ${error.message}`;
  }
}
