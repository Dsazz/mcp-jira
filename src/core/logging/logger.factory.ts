/**
 * Logger Factory
 *
 * Factory functions for creating logger instances
 */
import type { Logger } from "./log.types";
import { SimpleLogger } from "./simple-logger";

/**
 * Default logger name
 */
const DEFAULT_LOGGER_NAME = "MCP";

/**
 * Create a logger with the specified name
 *
 * @param name - The logger name
 * @returns A logger instance
 */
export function getLogger(name = DEFAULT_LOGGER_NAME): Logger {
  return new SimpleLogger(name);
}

/**
 * Default logger instance for general application use
 */
export const logger = getLogger();
