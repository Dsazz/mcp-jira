/**
 * Shared JIRA mock factory for testing
 */
import { mock } from "bun:test";

/**
 * Creates a mock JIRA client
 */
export function createMockJiraClient() {
  return {
    request: mock(),
    get: mock(),
    post: mock(),
    put: mock(),
    delete: mock(),
  };
}

/**
 * Creates a mock error response
 */
export function createMockErrorResponse(status: number, message: string) {
  return {
    status,
    data: {
      errorMessages: [message],
    },
  };
}

/**
 * Creates standard JIRA pagination options
 */
export function createPaginationOptions(startAt = 0, maxResults = 50) {
  return {
    startAt,
    maxResults,
  };
}
