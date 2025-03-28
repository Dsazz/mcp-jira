import { formatLogMessage } from "./log-format.util";
import { shouldLog } from "./log-level.util";
/**
 * Simple Logger Implementation
 *
 * Basic console logger implementation
 */
import type { LogMetadata, Logger } from "./log.types";

/**
 * Simple logger implementation that logs to the console
 */
export class SimpleLogger implements Logger {
  /**
   * Logger name used in log messages
   */
  private name: string;

  /**
   * Create a new simple logger
   *
   * @param name - The logger name
   */
  constructor(name = "MCP") {
    this.name = name;
  }

  /**
   * Log a debug message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  debug(message: unknown, metadata?: LogMetadata): void {
    if (!shouldLog("debug")) return;
    const formatted = formatLogMessage(message, metadata);
    // Use stderr for all MCP logs to avoid interfering with JSON-RPC
    console.error(`[DEBUG][${this.name}] ${formatted}`);
  }

  /**
   * Log an info message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  info(message: unknown, metadata?: LogMetadata): void {
    if (!shouldLog("info")) return;
    const formatted = formatLogMessage(message, metadata);
    // Use stderr for all MCP logs to avoid interfering with JSON-RPC
    console.error(`[INFO][${this.name}] ${formatted}`);
  }

  /**
   * Log a warning message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  warn(message: unknown, metadata?: LogMetadata): void {
    if (!shouldLog("warn")) return;
    const formatted = formatLogMessage(message, metadata);
    // Use stderr for all MCP logs to avoid interfering with JSON-RPC
    console.error(`[WARN][${this.name}] ${formatted}`);
  }

  /**
   * Log an error message
   *
   * @param message - The message to log
   * @param metadata - Optional metadata to include
   */
  error(message: unknown, metadata?: LogMetadata): void {
    if (!shouldLog("error")) return;
    const formatted = formatLogMessage(message, metadata);
    console.error(`[ERROR][${this.name}] ${formatted}`);
  }
}
