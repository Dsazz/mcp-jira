import { logger, getLogger, Logger } from '../index';

// Mock the Logger class
jest.mock('../logger', () => {
  const mockWithContext = jest.fn().mockReturnValue({ mockLogger: true });
  
  return {
    Logger: jest.fn().mockImplementation(() => ({
      withContext: mockWithContext
    }))
  };
});

describe('Logging module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logger', () => {
    it('should export a default logger instance', () => {
      // Since we've mocked the Logger, we just check if it exists
      expect(logger).toBeTruthy();
    });
  });

  describe('getLogger', () => {
    it('should return a logger with the provided context', () => {
      const contextLogger = getLogger('test-context');
      expect(contextLogger).toBeTruthy();
      
      // Verify that withContext was called with the correct parameters
      expect(logger.withContext).toHaveBeenCalledWith('test-context');
    });
  });
}); 