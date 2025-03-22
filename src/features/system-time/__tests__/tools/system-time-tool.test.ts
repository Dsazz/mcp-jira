/**
 * Unit tests for SystemTimeTool
 */
import { SystemTimeTool } from '../../tools/system-time-tool';
import { SystemTimeConfig } from '../../config/system-time-config';
import { McpResponse } from '../../../../shared/types/mcp-types';

// Mock logger
jest.mock('../../../../shared/logging');

// Create a concrete implementation of the abstract class for testing
class TestSystemTimeTool extends SystemTimeTool<string, string> {
  constructor(config: SystemTimeConfig) {
    super('TestTool', config);
  }
  
  protected execute(params: string): string {
    // Explicitly call getConfig to ensure the test covers it
    const config = this.getConfig();
    return `Executed with: ${params}, format: ${config.defaultDateFormat}`;
  }
}

describe('SystemTimeTool', () => {
  let tool: TestSystemTimeTool;
  let config: SystemTimeConfig;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup config and tool
    config = new SystemTimeConfig('yyyy-MM-dd');
    tool = new TestSystemTimeTool(config);
  });
  
  it('should properly initialize with config', () => {
    // Assert - we're checking the protected method via type assertion
    const typedTool = tool as any;
    expect(typedTool.featureName).toBe('SystemTime');
    expect(typedTool.toolName).toBe('TestTool');
    expect(typedTool.config).toBe(config);
  });
  
  it('should use getConfig to access the typed config', () => {
    // Act
    const result = tool.handler('test parameter') as McpResponse;
    
    // Assert
    expect(result.content[0].text).toContain('format: yyyy-MM-dd');
  });
  
  it('should properly handle execution', () => {
    // Act
    const result = tool.handler('test parameter') as McpResponse;
    
    // Assert
    expect(result).toEqual({
      content: [{ 
        type: 'text', 
        text: 'Executed with: test parameter, format: yyyy-MM-dd'
      }]
    });
  });
  
  it('should handle errors during execution', () => {
    // Arrange - create a tool that throws during execution
    class ErrorTool extends SystemTimeTool<string, string> {
      constructor(config: SystemTimeConfig) {
        super('ErrorTool', config);
      }
      
      protected execute(): string {
        throw new Error('Test error');
      }
    }
    
    const errorTool = new ErrorTool(config);
    
    // Act
    const result = errorTool.handler('test') as McpResponse;
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toBe('Test error');
  });
}); 