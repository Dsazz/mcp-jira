#!/usr/bin/env node

import { config } from 'dotenv';
import { startServer } from './server';
import { logger } from './shared';

// Initialize and start the server
async function init(): Promise<void> {
  try {
    // Load .env file if it exists
    config();

    // Start the server
    await startServer();
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'Startup', 
      isMcp: true 
    });
    process.exit(1);
  }
}

// Start the server
init().catch((error) => {
  logger.error(error instanceof Error ? error : new Error(String(error)), { 
    prefix: 'Server', 
    isMcp: true 
  });
  process.exit(1);
}); 