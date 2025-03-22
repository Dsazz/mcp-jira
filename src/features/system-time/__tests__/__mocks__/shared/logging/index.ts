/**
 * Mock for logging
 * This file is automatically used when calling jest.mock('../../../../shared/logging')
 */

import { jest } from '@jest/globals';

const mockLoggerMethods = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock for base loggers
export const appLogger = { ...mockLoggerMethods };
export const mcpLogger = { ...mockLoggerMethods };

// Legacy logger for backward compatibility
export const logger = { ...mockLoggerMethods };

// Mock FeatureLogger class
export class FeatureLogger {
  constructor(private readonly featureName: string) {}
  
  debug = mockLoggerMethods.debug;
  info = mockLoggerMethods.info;
  warn = mockLoggerMethods.warn;
  error = mockLoggerMethods.error;
  
  forTool(toolName: string) {
    return new ToolLogger(this.featureName, toolName);
  }
}

// Mock ToolLogger class
export class ToolLogger {
  constructor(
    private readonly featureName: string, 
    private readonly toolName: string
  ) {}
  
  debug = mockLoggerMethods.debug;
  info = mockLoggerMethods.info;
  warn = mockLoggerMethods.warn;
  error = mockLoggerMethods.error;
}

// Mock featureLogger factory
export const featureLogger = (featureName: string) => new FeatureLogger(featureName); 