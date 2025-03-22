/**
 * Error normalization utility
 * Provides functions to standardize error handling across the codebase
 */

/**
 * Converts any error-like value to a proper Error object
 * This replaces the common pattern: error instanceof Error ? error : new Error(String(error))
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
} 