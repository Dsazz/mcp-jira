import { ServerCleanup } from '../types';
import { logger } from '../../shared/logging';
import { normalizeError } from '../../shared/errors';

/**
 * Sets up global error handlers for uncaught exceptions and unhandled rejections
 */
export function setupErrorHandlers(cleanup: ServerCleanup): void {
  process.on('uncaughtException', (error) => {
    const normalizedError = normalizeError(error);
    logger.error(`Uncaught exception: ${normalizedError.message}`, { 
      prefix: 'Server'
    });
    cleanup(1);
  });

  process.on('unhandledRejection', (error) => {
    const normalizedError = normalizeError(error);
    logger.error(`Unhandled rejection: ${normalizedError.message}`, { 
      prefix: 'Server'
    });
    cleanup(1);
  });
}

/**
 * Handles an error with proper logging and exits the process
 */
export function handleError(error: unknown, context: string): never {
  const normalizedError = normalizeError(error);
  logger.error(`${context}: ${normalizedError.message}`, { 
    prefix: 'Server'
  });
  process.exit(1);
} 