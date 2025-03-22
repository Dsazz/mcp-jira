import { createServer, initializeServer } from '../lifecycle';
import { logger } from '../../shared/logging';
import { registerFeatures } from '../register';
import { setupErrorHandlers, setupSignalHandlers } from '../handlers';

// Mock the features so we don't need to import them
jest.mock('../../features/jira', () => ({
  initializeJiraFeature: jest.fn()
}));

jest.mock('../../features/system-time', () => ({
  registerSystemTimeTools: jest.fn()
}));

// Mock dependencies
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  return {
    McpServer: jest.fn().mockImplementation((config) => ({
      config,
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn()
    }))
  };
});

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => {
  return {
    StdioServerTransport: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
      onclose: null,
      onerror: null
    }))
  };
});

jest.mock('../register');
jest.mock('../handlers');
jest.mock('../../shared/logging');

describe('Server Lifecycle', () => {
  // Mock process.env for tests
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore process.env before each test
    process.env = { ...originalEnv };
    
    // Mock process.stdin.resume to prevent hanging
    jest.spyOn(process.stdin, 'resume').mockImplementation(() => {
      return process.stdin;
    });
  });
  
  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  describe('createServer', () => {
    test('should create server and transport instances', async () => {
      // Call createServer
      const result = await createServer();
      
      // Verify server and transport were created
      expect(result.server).toBeDefined();
      expect(result.transport).toBeDefined();
      expect(typeof result.cleanup).toBe('function');
    });
    
    test('cleanup function should handle successful shutdown', async () => {
      // Mock process.exit to prevent test from exiting
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Create server and get cleanup function
      const { server, transport, cleanup } = await createServer();
      
      // Call cleanup function
      cleanup(0);
      
      // Verify logging and shutdown calls
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Shutting down MCP server (exit code: 0)'),
        expect.objectContaining({ prefix: 'Server' })
      );
      expect(transport.close).toHaveBeenCalled();
      expect(server.close).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
      
      // Restore original process.exit
      mockExit.mockRestore();
    });
    
    test('cleanup function should handle errors during shutdown', async () => {
      // Mock process.exit to prevent test from exiting
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      // Create server and get cleanup function
      const { transport, cleanup } = await createServer();
      
      // Make transport.close throw an error when called
      const testError = new Error('Close error');
      (transport.close as jest.Mock).mockImplementation(() => {
        throw testError;
      });
      
      // Call cleanup function
      cleanup(1);
      
      // Verify error logging
      expect(logger.error).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Restore mock
      mockExit.mockRestore();
    });
  });

  describe('initializeServer', () => {
    test('should initialize server with all components', async () => {
      // Call initializeServer
      await initializeServer();
      
      // Verify initialization steps
      expect(setupErrorHandlers).toHaveBeenCalled();
      expect(setupSignalHandlers).toHaveBeenCalled();
      expect(registerFeatures).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'MCP Server connected successfully',
        expect.objectContaining({ prefix: 'Server' })
      );
    });
    
    test('should log config in development environment', async () => {
      // Set NODE_ENV to development
      process.env.NODE_ENV = 'development';
      
      // Call initializeServer
      await initializeServer();
      
      // Verify config logging
      expect(logger.debug).toHaveBeenCalled();
    });
    
    test('should set up transport event handlers', async () => {
      // Create mock for testing transport callbacks
      const MockedStdioTransport = require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
      
      // Create a mock instance with the callbacks we want to test
      const mockTransport = {
        close: jest.fn(),
        onclose: null as (() => void) | null,
        onerror: null as ((error: Error) => void) | null
      };
      
      // Mock the constructor to return our mockTransport
      MockedStdioTransport.mockImplementationOnce(() => mockTransport);
      
      // Call initializeServer which will use our mock
      await initializeServer();
      
      // Save the callbacks that were set
      const onclose = mockTransport.onclose;
      const onerror = mockTransport.onerror;
      
      // Verify callbacks were set
      expect(onclose).toBeDefined();
      expect(onerror).toBeDefined();
      
      // Test onclose callback
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      
      if (onclose) {
        onclose();
        expect(logger.info).toHaveBeenCalledWith(
          'Transport closed',
          expect.objectContaining({ prefix: 'Server' })
        );
      }
      
      // Test onerror callback
      if (onerror) {
        const testError = new Error('Transport error');
        onerror(testError);
        expect(logger.error).toHaveBeenCalledWith(
          testError,
          expect.objectContaining({ prefix: 'Server' })
        );
      }
      
      mockExit.mockRestore();
    });
  });
}); 