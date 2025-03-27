import { mock } from "bun:test";
import type { LogOptions } from "../logger";

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

/**
 * MockLogger class for use in tests
 * Implements the same interface as Logger but with mock methods for assertions
 */
export class MockLogger {
  public mockDebug = mock((_message: unknown, _options?: LogOptions) => {});
  public mockInfo = mock((_message: unknown, _options?: LogOptions) => {});
  public mockWarn = mock((_message: unknown, _options?: LogOptions) => {});
  public mockError = mock((_message: unknown, _options?: LogOptions) => {});
  public mockChild = mock(() => new MockLogger());
  public mockWithContext = mock((_context: string) => new MockLogger());

  constructor(public readonly context?: string) {}

  debug(message: unknown, options?: LogOptions): void {
    if (process.env.NODE_ENV === "production") return;
    this.mockDebug(message, options);
  }

  info(message: unknown, options?: LogOptions): void {
    this.mockInfo(message, options);
  }

  warn(message: unknown, options?: LogOptions): void {
    this.mockWarn(message, options);
  }

  error(message: unknown, options?: LogOptions): void {
    this.mockError(message, options);
  }

  child(): MockLogger {
    return this.mockChild();
  }

  withContext(context: string): MockLogger {
    return this.mockWithContext(context);
  }
}
