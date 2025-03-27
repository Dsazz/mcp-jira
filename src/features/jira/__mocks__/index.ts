/**
 * Export all test mocks and utilities
 */

// API mocks
export * from './api.mock';

// Logger mocks
export * from './logger.mock';

// Formatter mocks
export * from './formatter.mock';

// Config mocks
export * from './config.mock';

// Test utilities
export * from './test-utils';

/**
 * Setup all commonly used mocks at once
 */
export const setupAllMocks = () => {
  const { setupApiMock } = require('./api.mock');
  const { setupLoggerMock } = require('./logger.mock');
  const { setupFormatterMocks } = require('./formatter.mock');
  const { setupConfigMock } = require('./config.mock');
  
  setupApiMock();
  setupLoggerMock();
  setupFormatterMocks();
  setupConfigMock();
};

/**
 * Clear all mock functions
 */
export const clearAllMocks = () => {
  const { clearApiMocks } = require('./api.mock');
  const { clearLoggerMocks } = require('./logger.mock');
  const { clearFormatterMocks } = require('./formatter.mock');
  const { clearConfigMocks } = require('./config.mock');
  
  clearApiMocks();
  clearLoggerMocks();
  clearFormatterMocks();
  clearConfigMocks();
}; 