#!/usr/bin/env node

import { config } from 'dotenv';
import { startServer } from './server';
import { logger } from './shared/logging';
import { normalizeError } from './shared/errors';

/**
 * Configure environment variables and start the application
 */
async function bootstrap(): Promise<void> {
  try {
    // Load environment variables
    config();
    logger.info('Environment configured', { prefix: 'Bootstrap' });
    
    // Start the MCP server (which handles its own lifecycle)
    await startServer();
  } catch (error) {
    // Basic error handling for bootstrap process
    logger.error(normalizeError(error), { 
      prefix: 'Bootstrap' 
    });
    process.exit(1);
  }
}

// Start the application
bootstrap().catch(error => {
  logger.error(normalizeError(error), { 
    prefix: 'Bootstrap' 
  });
  process.exit(1);
}); 