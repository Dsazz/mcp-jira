/// <reference types="bun-types" />
import {
  type Mock,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  mock,
} from "bun:test";

// Basic mock function type
type MockableFunction = (...args: unknown[]) => unknown;
export type MockFunction<T extends MockableFunction> = Mock<T>;

/**
 * Create a mock object with partial implementation
 * Simplified version that works with Bun's mock system
 */
export function createMock<T extends object>(implementation: Partial<T> = {}): T {
  return new Proxy({} as T, {
    get: (_target, prop) => {
      if (prop in implementation) {
        return implementation[prop as keyof T];
      }
      if (typeof prop === "string" && !["then", "catch"].includes(prop)) {
        return mock(() => undefined);
      }
      return undefined;
    },
  });
}

export function mockFn<T extends MockableFunction>(): MockFunction<T> {
  return mock(() => undefined) as MockFunction<T>;
}

export function spyOn<T extends object, K extends keyof T>(
  obj: T,
  method: K,
): T[K] extends MockableFunction ? MockFunction<T[K]> : never {
  const mockFn = mock(() => undefined);
  Object.defineProperty(obj, method, {
    value: mockFn,
    configurable: true,
    writable: true,
  });
  return mockFn as T[K] extends MockableFunction ? MockFunction<T[K]> : never;
}

export function createSpyObj<T extends Record<string, MockableFunction>>(
  methodNames: (keyof T)[],
): { [K in keyof T]: MockFunction<T[K]> } {
  const obj = {} as { [K in keyof T]: MockFunction<T[K]> };
  for (const method of methodNames) {
    obj[method] = mock(() => undefined) as unknown as MockFunction<
      T[typeof method]
    >;
  }
  return obj;
}

// Type-safe module mocking
export function mockModule<T extends object>(
  modulePath: string,
  implementation: Partial<T>,
): void {
  mock.module(modulePath, () => implementation);
}

// Type-safe module retrieval
export function getMockedModule<T>(name: string): T {
  const key = `mock_${name}`;
  const mockedModule = (globalThis as Record<string, unknown>)[key];
  if (!mockedModule) {
    throw new Error(`No mocked module found for ${name}`);
  }
  return mockedModule as T;
}

/**
 * Mock console implementation
 * Silences console output during tests
 */
const mockConsole = {
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
};

// Helper function for cleaning up mocks
function cleanupMocks(): void {
  for (const key of Object.keys(globalThis)) {
    if (key.startsWith("mock_")) {
      delete (globalThis as Record<string, unknown>)[key];
    }
  }
}

// Setup and cleanup hooks
beforeAll(() => {
  // Silence console output during tests
  global.console = { ...console, ...mockConsole };
});

// Clear any test state between runs
beforeEach(() => {
  cleanupMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanupMocks();
});

afterAll(() => {
  // Restore original console
  global.console = console;
});
