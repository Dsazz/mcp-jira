/**
 * Reusable mock for the JIRA configuration
 */
import { jest } from '@jest/globals';

// Mock config
export const mockConfig = {
  username: 'test-user',
  apiToken: 'test-token',
  host: 'https://test-jira.atlassian.net',
  getConfig: jest.fn(),
  logConfigStatus: jest.fn()
};

// Setup the mock for the config module
export const setupConfigMock = () => {
  jest.mock('../../config/config', () => ({
    getConfig: mockConfig.getConfig,
    logConfigStatus: mockConfig.logConfigStatus
  }));
  
  // Default implementation
  mockConfig.getConfig.mockReturnValue({
    username: mockConfig.username,
    apiToken: mockConfig.apiToken,
    host: mockConfig.host
  });
};

// Helper to clear all config mocks
export const clearConfigMocks = () => {
  mockConfig.getConfig.mockClear();
  mockConfig.logConfigStatus.mockClear();
}; 