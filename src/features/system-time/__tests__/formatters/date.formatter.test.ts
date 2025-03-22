/**
 * Unit tests for DateFormatter
 */
import { DateFormatter, DateFormatOptions } from '../../formatters/date.formatter';
import { format } from 'date-fns';

// This will use the mock from __mocks__/date-fns.ts
jest.mock('date-fns');

describe('DateFormatter', () => {
  let formatter: DateFormatter;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create formatter instance
    formatter = new DateFormatter();
  });
  
  it('should format current date with default format when no options provided', () => {
    // Arrange
    const options: DateFormatOptions = {};
    
    // Act
    const result = formatter.format(options);
    
    // Assert
    expect(format).toHaveBeenCalledWith(expect.any(Date), 'yyyy-MM-dd HH:mm:ss');
    expect(result).toBe('Formatted: yyyy-MM-dd HH:mm:ss');
  });
  
  it('should format with custom format string when provided', () => {
    // Arrange
    const options: DateFormatOptions = { format: 'MMM dd, yyyy' };
    
    // Act
    const result = formatter.format(options);
    
    // Assert
    expect(format).toHaveBeenCalledWith(expect.any(Date), 'MMM dd, yyyy');
    expect(result).toBe('Formatted: MMM dd, yyyy');
  });
  
  it('should use provided date when specified', () => {
    // Arrange
    const testDate = new Date(2023, 0, 1, 12, 0, 0); // Jan 1, 2023, 12:00:00
    const options: DateFormatOptions = { date: testDate };
    
    // Act
    const result = formatter.format(options);
    
    // Assert
    expect(format).toHaveBeenCalledWith(testDate, 'yyyy-MM-dd HH:mm:ss');
  });
  
  it('should throw error when date-fns format throws', () => {
    // Arrange
    (format as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid format string');
    });
    
    // Act & Assert
    expect(() => formatter.format({})).toThrow('Failed to format date: Invalid format string');
  });
  
  it('should handle non-Error exceptions from date-fns', () => {
    // Arrange
    (format as jest.Mock).mockImplementationOnce(() => {
      throw 'Some non-error exception';
    });
    
    // Act & Assert
    expect(() => formatter.format({})).toThrow('Failed to format date: Some non-error exception');
  });
}); 