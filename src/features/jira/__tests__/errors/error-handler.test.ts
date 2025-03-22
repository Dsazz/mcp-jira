// Mock the shared logging module
jest.mock('../../../../shared/logging', () => {
  // Create mock functions
  const mockInfo = jest.fn();
  const mockWarn = jest.fn();
  const mockError = jest.fn();
  const mockDebug = jest.fn();
  
  // Create a mock logger instance
  const mockLogger = {
    info: mockInfo,
    warn: mockWarn,
    error: mockError,
    debug: mockDebug
  };
  
  // Return the mocked module
  return {
    getLogger: jest.fn().mockReturnValue(mockLogger)
  };
});

import { handleError } from '../../errors/error-handler';
import { 
  ApiError, 
  NotFoundError, 
  AuthorizationError, 
  ServerError,
  ValidationError
} from '../../errors/api-errors';
import { getLogger } from '../../../../shared/logging';
import { expectErrorResponse } from '../__mocks__/test-utils';

describe('Error Handler', () => {
  const mockLogger = getLogger('JIRA');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should handle NotFoundError with appropriate message', () => {
    // Arrange
    const error = new NotFoundError('Issue not found');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'ISSUE_NOT_FOUND', 'Issue not found');
    expect(mockLogger.info).toHaveBeenCalled();
  });
  
  it('should handle ValidationError with appropriate message', () => {
    // Arrange
    const error = new ValidationError('Invalid parameter');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'VALIDATION_ERROR', 'Invalid parameter');
    expect(mockLogger.warn).toHaveBeenCalled();
  });
  
  it('should handle AuthorizationError with appropriate message', () => {
    // Arrange
    const error = new AuthorizationError('Permission denied');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'AUTHORIZATION_FAILED', 'Failed to authorize with JIRA');
    expect(mockLogger.error).toHaveBeenCalled();
  });
  
  it('should handle ServerError with appropriate message', () => {
    // Arrange
    const error = new ServerError('Internal server error');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'SERVER_ERROR', 'Internal server error');
    expect(mockLogger.error).toHaveBeenCalled();
  });
  
  it('should handle generic ApiError with appropriate message', () => {
    // Arrange
    const error = new ApiError('Unknown error', 400, 'BAD_REQUEST');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'BAD_REQUEST', 'Unknown error');
    expect(mockLogger.error).toHaveBeenCalled();
  });
  
  it('should handle non-API errors as unexpected errors', () => {
    // Arrange
    const error = new Error('Unexpected error');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'UNKNOWN_ERROR', 'Unexpected error');
    expect(mockLogger.error).toHaveBeenCalled();
  });
}); 