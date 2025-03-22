/**
 * Index file for the MCP logging system
 * Exports the unified logger
 */

// Export everything from logger
export { Logger, type LogOptions, type LogLevel } from './logger';

// Create and export default instances
import { Logger } from './logger';
const logger = new Logger();

// For feature/tool specific logging
export function getLogger(context: string): Logger {
  return logger.withContext(context);
}

// Export standard logger instance
export { logger }; 