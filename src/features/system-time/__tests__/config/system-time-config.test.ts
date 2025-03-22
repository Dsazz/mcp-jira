/**
 * Unit tests for SystemTimeConfig
 */
import { SystemTimeConfig } from '../../config/system-time-config';

describe('SystemTimeConfig', () => {
  it('should be created with default format when no format provided', () => {
    // Arrange & Act
    const config = new SystemTimeConfig();
    
    // Assert
    expect(config.defaultDateFormat).toBe('yyyy-MM-dd HH:mm:ss');
    expect(config.name).toBe('SystemTime');
  });
  
  it('should be created with custom format when provided', () => {
    // Arrange & Act
    const config = new SystemTimeConfig('MMM dd, yyyy');
    
    // Assert
    expect(config.defaultDateFormat).toBe('MMM dd, yyyy');
  });
  
  it('should always be valid', () => {
    // Arrange
    const config = new SystemTimeConfig();
    
    // Act
    const isValid = config.isValid();
    
    // Assert
    expect(isValid).toBe(true);
  });
  
  it('should return correct diagnostics', () => {
    // Arrange
    const config = new SystemTimeConfig('dd/MM/yyyy');
    
    // Act
    const diagnostics = config.getDiagnostics();
    
    // Assert
    expect(diagnostics).toEqual({
      defaultDateFormat: 'dd/MM/yyyy'
    });
  });
}); 