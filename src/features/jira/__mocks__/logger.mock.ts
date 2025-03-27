/**
 * Reusable mock for the logger
 */
import { jest } from '@jest/globals';

// Create mock logger functions
const mockInfo = jest.fn();
const mockError = jest.fn();
const mockDebug = jest.fn();
const mockWarn = jest.fn();

// Export mock logger
export const mockLogger = {
  info: mockInfo,
  error: mockError,
  debug: mockDebug,
  warn: mockWarn
};

// Setup the mock for the logger module
export const setupLoggerMock = () => {
  jest.mock('../../../../shared/logger', () => ({
    logger: mockLogger
  }));
};

// Helper to clear all logger mocks
export const clearLoggerMocks = () => {
  mockInfo.mockClear();
  mockError.mockClear();
  mockDebug.mockClear();
  mockWarn.mockClear();
}; 