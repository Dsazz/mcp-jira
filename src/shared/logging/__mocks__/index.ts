/**
 * Mock logging module for testing
 */
import { LogLevel } from '../logger';

export interface LogOptions {
  prefix?: string;
}

/**
 * Mock Logger class
 */
export class Logger {
  constructor(public readonly context?: string) {}
  
  withContext = jest.fn().mockImplementation((context: string) => {
    return new Logger(context);
  });
  
  debug = jest.fn();
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
}

// Create and export the default logger instance
export const logger = new Logger();

// Mock getLogger function
export const getLogger = jest.fn().mockImplementation((context: string) => {
  return new Logger(context);
});

// Export types
export { LogLevel };

// Helper functions for testing
export const resetAllMocks = () => {
  (logger.debug as jest.Mock).mockReset();
  (logger.info as jest.Mock).mockReset();
  (logger.warn as jest.Mock).mockReset();
  (logger.error as jest.Mock).mockReset();
  (logger.withContext as jest.Mock).mockReset();
  
  (getLogger as jest.Mock).mockReset();
  (getLogger as jest.Mock).mockImplementation((context: string) => {
    return new Logger(context);
  });
}; 