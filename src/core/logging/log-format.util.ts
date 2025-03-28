/**
 * Log Formatting Utilities
 *
 * Utilities for formatting log messages and metadata
 */
import type { LogMetadata } from "./log.types";

/**
 * Format a log message with optional metadata
 *
 * @param message - The message to format
 * @param metadata - Optional metadata to include
 * @returns Formatted log message string
 */
export function formatLogMessage(
  message: unknown,
  metadata?: LogMetadata,
): string {
  // Convert message to string based on type
  const messageStr =
    typeof message === "string"
      ? message
      : typeof message === "object"
        ? JSON.stringify(message, null, 2)
        : String(message);

  // Add prefix if present
  const prefix = metadata?.prefix ? `[${metadata.prefix}] ` : "";

  // Format additional metadata if present
  const metadataStr =
    metadata && Object.keys(metadata).filter((k) => k !== "prefix").length > 0
      ? `\n${JSON.stringify(
          Object.fromEntries(
            Object.entries(metadata).filter(([k]) => k !== "prefix"),
          ),
          null,
          2,
        )}`
      : "";

  return `${prefix}${messageStr}${metadataStr}`;
}
