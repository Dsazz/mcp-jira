/**
 * Logging Types
 *
 * Type definitions for the logging system
 */

/**
 * Log levels
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Optional log entry metadata
 */
export interface LogMetadata {
  /**
   * Optional prefix for the log entry
   */
  prefix?: string;

  /**
   * Additional data to log
   */
  [key: string]: unknown;
}

/**
 * Logger interface
 */
export interface Logger {
  /**
   * Log debug message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  debug(message: unknown, metadata?: LogMetadata): void;

  /**
   * Log informational message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  info(message: unknown, metadata?: LogMetadata): void;

  /**
   * Log warning message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  warn(message: unknown, metadata?: LogMetadata): void;

  /**
   * Log error message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  error(message: unknown, metadata?: LogMetadata): void;
}
