import { mock } from "bun:test";
import type { LogOptions } from "../../shared/logging/logger";

/**
 * Creates a mock logger that can be used in tests.
 * All methods are mocked to allow spying and assertions on calls.
 */
export const mockLogger = {
  debug: mock((_message: unknown, _options?: LogOptions) => {}),
  info: mock((_message: unknown, _options?: LogOptions) => {}),
  warn: mock((_message: unknown, _options?: LogOptions) => {}),
  error: mock((_message: unknown, _options?: LogOptions) => {}),
  child: mock(() => mockLogger),
  withContext: mock((_context: string) => mockLogger)
};

/**
 * Resets all mocks on the logger for clean state between tests
 */
export function resetMockLogger(): void {
  mockLogger.debug.mockReset();
  mockLogger.info.mockReset();
  mockLogger.warn.mockReset();
  mockLogger.error.mockReset();
  mockLogger.child.mockReset();
  mockLogger.withContext.mockReset();
}
