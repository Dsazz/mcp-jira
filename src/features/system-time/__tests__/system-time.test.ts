/**
 * Unit tests for System Time feature registration
 */
import { registerSystemTimeTools } from '../index';
import { GetTimeTool } from '../tools/get-time/get-time.tool';
import { getLogger } from '../../../shared/logging';

// Mock dependencies
jest.mock('../../../shared/logging');
jest.mock('../tools/get-time/get-time.tool');

describe('System Time Registration', () => {
  // Mock server
  const mockServer = {
    tool: jest.fn()
  };
  
  // Mock logger
  const mockLogger = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock implementation for featureLogger
    (getLogger as jest.Mock).mockReturnValue(mockLogger);
  });
  
  it('should register get_system_time tool with the server', () => {
    // Act
    registerSystemTimeTools(mockServer as any);
    
    // Assert
    expect(GetTimeTool).toHaveBeenCalledTimes(1);
    expect(mockServer.tool).toHaveBeenCalledTimes(1);
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_system_time',
      'Retrieves the current system time in the specified format',
      expect.objectContaining({
        format: expect.any(Object)
      }),
      expect.any(Function)
    );
    
    // Verify logger was used
    expect(getLogger).toHaveBeenCalledWith('SystemTime');
    expect(mockLogger.info).toHaveBeenCalledWith('Registering System Time tools');
  });
}); 