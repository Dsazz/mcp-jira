/**
 * Log Level Utilities
 *
 * Utilities for determining and managing log levels
 */

import type { LogLevel } from "./log.types";

/**
 * Default log level based on environment
 */
export const DEFAULT_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

/**
 * Get the current log level from environment or default
 *
 * @returns The current log level
 */
export function getLogLevel(): LogLevel {
  const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (envLogLevel && ["debug", "info", "warn", "error"].includes(envLogLevel)) {
    return envLogLevel;
  }
  return DEFAULT_LOG_LEVEL;
}

/**
 * Check if a log level should be logged based on the current log level
 *
 * @param level - The log level to check
 * @returns Whether the level should be logged
 */
export function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  return levels[level] >= levels[currentLevel];
}
