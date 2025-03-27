/**
 * Mocks for server components
 */
import { mock } from "bun:test";
import { mockLogger } from "./logger.mock";

/**
 * Mock for server close method
 */
export const mockServerClose = mock(() => Promise.resolve());

/**
 * Mock for server connect method
 */
export const mockServerConnect = mock(() => Promise.resolve());

/**
 * Mock for transport close method
 */
export const mockTransportClose = mock(() => Promise.resolve());

/**
 * Creates a mock for McpServer
 */
export const createMockServer = () => ({
  config: {},
  connect: mockServerConnect,
  close: mockServerClose,
});

/**
 * Mock constructor for McpServer
 */
export const mockMcpServer = mock(() => createMockServer());

/**
 * Creates a transport with spy handlers
 */
export class TransportWithSpies {
  private _onclose: (() => void) | null = null;
  private _onerror: ((error: Error) => void) | null = null;
  
  close = mockTransportClose;
  
  set onclose(handler: (() => void) | null) {
    this._onclose = handler;
  }
  
  get onclose(): (() => void) | null {
    return this._onclose;
  }
  
  set onerror(handler: ((error: Error) => void) | null) {
    this._onerror = handler;
  }
  
  get onerror(): ((error: Error) => void) | null {
    return this._onerror;
  }
  
  executeOnclose(): void {
    if (this._onclose) {
      this._onclose();
    }
  }
  
  executeOnerror(error: Error): void {
    if (this._onerror) {
      this._onerror(error);
    }
  }
}

/**
 * Create a spy transport instance
 */
export const transportWithSpies = new TransportWithSpies();

/**
 * Mock for StdioServerTransport
 */
export const mockStdioTransport = mock(() => ({
  close: mockTransportClose,
  onclose: null,
  onerror: null,
}));

/**
 * Mock for StdioServerTransport with spy handlers
 */
export const mockStdioTransportWithSpies = mock(() => transportWithSpies);

/**
 * Helper to execute cleanup and prepare for assertions
 * @param cleanup The cleanup function to call
 * @param exitCode The exit code to pass to cleanup
 */
export function executeCleanup(cleanup: (exitCode?: number) => void, exitCode = 0) {
  // Call cleanup function
  cleanup(exitCode);
}

/**
 * Reset all server mocks
 */
export function resetServerMocks() {
  mockServerClose.mockClear();
  mockServerConnect.mockClear();
  mockTransportClose.mockClear();
} 