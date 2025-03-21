// Mock the logger before importing to ensure proper mocking
jest.mock('../../../../shared/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

import { handleError } from '../../errors/error-handler';
import { 
  ApiError, 
  NotFoundError, 
  AuthorizationError, 
  ServerError,
  ValidationError
} from '../../errors/api-errors';
import { logger } from '../../../../shared/logger';
import { expectErrorResponse } from '../__mocks__/test-utils';

describe('Error Handler', () => {
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
    expect(logger.info).toHaveBeenCalled();
  });
  
  it('should handle ValidationError with appropriate message', () => {
    // Arrange
    const error = new ValidationError('Invalid parameter');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'VALIDATION_ERROR', 'Invalid parameter');
    expect(logger.warn).toHaveBeenCalled();
  });
  
  it('should handle AuthorizationError with appropriate message', () => {
    // Arrange
    const error = new AuthorizationError('Permission denied');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'AUTHORIZATION_FAILED', 'Failed to authorize with JIRA');
    expect(logger.error).toHaveBeenCalled();
  });
  
  it('should handle ServerError with appropriate message', () => {
    // Arrange
    const error = new ServerError('Internal server error');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'SERVER_ERROR', 'Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });
  
  it('should handle generic ApiError with appropriate message', () => {
    // Arrange
    const error = new ApiError('Unknown error', 400, 'BAD_REQUEST');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'BAD_REQUEST', 'Unknown error');
    expect(logger.error).toHaveBeenCalled();
  });
  
  it('should handle non-API errors as unexpected errors', () => {
    // Arrange
    const error = new Error('Unexpected error');
    
    // Act
    const result = handleError(error);
    
    // Assert
    expectErrorResponse(result, 'UNKNOWN_ERROR', 'Unexpected error');
    expect(logger.error).toHaveBeenCalled();
  });
}); 