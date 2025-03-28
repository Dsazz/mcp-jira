/**
 * Logging Module
 *
 * Provides a simple, flexible logging system for MCP applications.
 */

// Core logger functionality
export { logger, getLogger } from "./logger.factory";

// Logger interface and types
export type { Logger, LogLevel, LogMetadata } from "./log.types";

// Utility functions for direct access if needed
export {
  shouldLog,
  getLogLevel,
  DEFAULT_LOG_LEVEL,
} from "./log-level.util";
export { formatLogMessage } from "./log-format.util";

// Logger implementation (typically used internally)
export { SimpleLogger } from "./simple-logger";
