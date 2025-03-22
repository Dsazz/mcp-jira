import { BaseTool } from '../base-tool';
import { McpResponse } from '../../types/mcp-types';
import { FeatureConfig } from '../../config/feature-config.interface';
import { Logger } from '../../logging';

// Mock the logging module
jest.mock('../../logging', () => {
  const mockLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  
  return {
    getLogger: jest.fn().mockReturnValue(mockLogger),
    Logger: jest.fn().mockImplementation(() => mockLogger)
  };
});

// Concrete implementation of BaseTool for testing
class TestTool extends BaseTool<string, string> {
  protected execute(params: string): string {
    if (params === 'throw') {
      throw new Error('Test error');
    }
    return `Processed: ${params}`;
  }
}

// Concrete implementation with async execution
class AsyncTestTool extends BaseTool<string, string> {
  protected async execute(params: string): Promise<string> {
    if (params === 'throw') {
      throw new Error('Async test error');
    }
    
    if (params === 'reject') {
      return Promise.reject(new Error('Promise rejection'));
    }
    
    return Promise.resolve(`Async processed: ${params}`);
  }
}

// Mock feature config
const mockValidConfig: FeatureConfig = {
  name: 'test-feature',
  isValid: jest.fn().mockReturnValue(true),
  getDiagnostics: jest.fn().mockReturnValue({})
};

const mockInvalidConfig: FeatureConfig = {
  name: 'test-feature',
  isValid: jest.fn().mockReturnValue(false),
  getDiagnostics: jest.fn().mockReturnValue({ error: 'Invalid config' })
};

describe('BaseTool', () => {
  const getLoggerMock = jest.mocked(require('../../logging').getLogger);
  
  let loggerMock: jest.Mocked<Logger>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    loggerMock = getLoggerMock() as unknown as jest.Mocked<Logger>;
  });
  
  describe('constructor', () => {
    it('should initialize with feature and tool names', () => {
      const tool = new TestTool('test-feature', 'test-tool');
      expect(getLoggerMock).toHaveBeenCalledWith('test-feature:test-tool');
    });
    
    it('should warn when initialized with invalid config', () => {
      const tool = new TestTool('test-feature', 'test-tool', mockInvalidConfig);
      expect(loggerMock.warn).toHaveBeenCalled();
      expect(mockInvalidConfig.getDiagnostics).toHaveBeenCalled();
    });
    
    it('should log debug when initialized with valid config', () => {
      const tool = new TestTool('test-feature', 'test-tool', mockValidConfig);
      expect(loggerMock.debug).toHaveBeenCalledWith('Tool initialized with valid configuration');
    });
  });
  
  describe('handler with synchronous execution', () => {
    let tool: TestTool;
    
    beforeEach(() => {
      tool = new TestTool('test-feature', 'test-tool');
    });
    
    it('should successfully process parameters', () => {
      const input = 'test input';
      const response = tool.handler(input) as McpResponse;
      
      expect(response.content[0].text).toBe('Processed: test input');
      expect(response.isError).toBeUndefined();
      expect(loggerMock.debug).toHaveBeenCalledWith('Tool execution started');
      expect(loggerMock.debug).toHaveBeenCalledWith('Tool execution completed successfully');
    });
    
    it('should return error response on exception', () => {
      const input = 'throw';
      const response = tool.handler(input) as McpResponse;
      
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toBe('Test error');
      expect(loggerMock.error).toHaveBeenCalled();
    });
    
    it('should format string results properly', () => {
      const input = 'test';
      const response = tool.handler(input) as McpResponse;
      
      expect(response.content[0].text).toBe('Processed: test');
    });
  });
  
  describe('handler with asynchronous execution', () => {
    let asyncTool: AsyncTestTool;
    
    beforeEach(() => {
      asyncTool = new AsyncTestTool('test-feature', 'async-test-tool');
    });
    
    it('should handle successful async processing', async () => {
      const input = 'test input';
      const responsePromise = asyncTool.handler(input) as Promise<McpResponse>;
      
      const response = await responsePromise;
      expect(response.content[0].text).toBe('Async processed: test input');
      expect(response.isError).toBeUndefined();
    });
    
    it('should handle exceptions in async execution', async () => {
      const input = 'throw';
      const responsePromise = asyncTool.handler(input) as Promise<McpResponse>;
      
      const response = await responsePromise;
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toBe('Async test error');
    });
    
    it('should handle promise rejections', async () => {
      const input = 'reject';
      const responsePromise = asyncTool.handler(input) as Promise<McpResponse>;
      
      const response = await responsePromise;
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toBe('Promise rejection');
    });
  });
}); 