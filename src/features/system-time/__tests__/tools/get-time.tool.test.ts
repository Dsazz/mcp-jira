/**
 * Unit tests for GetTimeTool
 */
import { GetTimeTool } from '../../tools/get-time/get-time.tool';
import { SystemTimeConfig } from '../../config/system-time-config';
import { DateFormatter } from '../../formatters/date.formatter';
import { validate } from '../../../../shared/validation/zod-validator';
// Mock dependencies
jest.mock('../../../../shared/validation/zod-validator');
jest.mock('../../../../shared/logging');
jest.mock('../../formatters/date.formatter');

describe('GetTimeTool', () => {
  let tool: GetTimeTool;
  let config: SystemTimeConfig;
  let mockFormatter: jest.Mocked<DateFormatter>;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create and configure mock formatter
    mockFormatter = {
      format: jest.fn().mockReturnValue('2023-01-01 12:00:00')
    } as any;
    
    // Mock the DateFormatter constructor to return our controlled mock
    (DateFormatter as jest.Mock).mockImplementation(() => mockFormatter);
    
    // Mock the validate function
    (validate as jest.Mock).mockImplementation((schema, params) => params);
    
    // Setup config and tool 
    config = new SystemTimeConfig('yyyy-MM-dd HH:mm:ss');
    tool = new GetTimeTool(config);
  });
  
  it('should format time with default format when no format parameter is provided', async () => {
    // Arrange
    const params = {};
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(validate).toHaveBeenCalledWith(expect.anything(), params, 'Invalid time parameters');
    expect(mockFormatter.format).toHaveBeenCalledWith({ format: 'yyyy-MM-dd HH:mm:ss' });
    expect(result).toEqual({
      content: [{ type: 'text', text: '2023-01-01 12:00:00' }]
    });
  });
  
  it('should format time with provided format parameter', async () => {
    // Arrange
    const params = { format: 'MMM dd, yyyy' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(validate).toHaveBeenCalledWith(expect.anything(), params, 'Invalid time parameters');
    expect(mockFormatter.format).toHaveBeenCalledWith({ format: 'MMM dd, yyyy' });
    expect(result).toEqual({
      content: [{ type: 'text', text: '2023-01-01 12:00:00' }]
    });
  });
  
  it('should support complex date-fns format strings', async () => {
    // Arrange
    const complexFormat = "EEEE, MMMM do, yyyy 'at' h:mm a 'in' OOOO";
    const params = { format: complexFormat };
    
    // Setup custom return value for this test
    mockFormatter.format.mockReturnValueOnce('Sunday, January 1st, 2023 at 12:00 PM in GMT+00:00');
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(validate).toHaveBeenCalledWith(expect.anything(), params, 'Invalid time parameters');
    expect(mockFormatter.format).toHaveBeenCalledWith({ format: complexFormat });
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Sunday, January 1st, 2023 at 12:00 PM in GMT+00:00' }]
    });
  });
  
  it('should handle validation errors appropriately', async () => {
    // Arrange
    (validate as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid format parameter');
    });
    
    // Act
    const result = await tool.handler({ format: '123' } as any);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toBe('Invalid format parameter');
  });
  
  it('should handle formatter errors appropriately', async () => {
    // Arrange
    mockFormatter.format.mockImplementationOnce(() => {
      throw new Error('Format error');
    });
    
    // Act
    const result = await tool.handler({});
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toBe('Format error');
  });
}); 