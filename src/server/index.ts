import { initializeServer } from './lifecycle';
import { logger } from '../shared/logging';
import { normalizeError } from '../shared/errors';

/**
 * Starts the MCP server
 */
export async function startServer(): Promise<void> {
  try {
    await initializeServer();
  } catch (error) {
    const normalizedError = normalizeError(error);
    logger.error(`Failed to start MCP server: ${normalizedError.message}`, { 
      prefix: 'Server'
    });
    process.exit(1);
  }
} 