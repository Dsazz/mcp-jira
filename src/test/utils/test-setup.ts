/**
 * Test Setup Utilities
 * Configuration and setup helpers for test environment
 */

import { beforeEach, afterEach } from 'bun:test';

/**
 * Mock console to avoid test output noise
 */
export function mockConsole() {
  const originalConsole = console;
  const mockConsole = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  };

  beforeEach(() => {
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
}

/**
 * Setup test environment variables
 */
export function setupTestEnv() {
  beforeEach(() => {
    process.env.JIRA_BASE_URL = 'https://test.atlassian.net';
    process.env.JIRA_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env.JIRA_BASE_URL = undefined;
    process.env.JIRA_EMAIL = undefined;
    process.env.JIRA_API_TOKEN = undefined;
  });
}

/**
 * Setup clean test state
 */
export function setupCleanState() {
  beforeEach(() => {
    // Reset any global state
    // Clear any caches or singletons if needed
  });
}

/**
 * Complete test setup with all common configurations
 */
export function setupTests() {
  setupTestEnv();
  setupCleanState();
  // Note: mockConsole() can be enabled per-test if needed
} 