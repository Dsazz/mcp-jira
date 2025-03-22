import { setupErrorHandlers, handleError } from '../handlers/error-handler';
import { setupSignalHandlers } from '../handlers/signal-handler';
import { logger } from '../../shared/logging';

// Mock dependencies
jest.mock('../../shared/logging');

describe('Server Handlers', () => {
  // Save original listeners and process.exit
  const originalListeners = process.listeners;
  const originalExit = process.exit;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock process methods
    process.on = jest.fn();
    process.exit = jest.fn() as any;
  });
  
  afterAll(() => {
    // Restore original methods
    process.listeners = originalListeners;
    process.exit = originalExit;
  });

  describe('Error Handler', () => {
    test('setupErrorHandlers should register event handlers for uncaught errors', () => {
      // Create mock cleanup function
      const mockCleanup = jest.fn();
      
      // Call setupErrorHandlers
      setupErrorHandlers(mockCleanup);
      
      // Verify event handlers were registered
      expect(process.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(process.on).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });
    
    test('uncaughtException handler should log and call cleanup', () => {
      // Create mock cleanup function
      const mockCleanup = jest.fn();
      
      // Setup handler
      setupErrorHandlers(mockCleanup);
      
      // Get the handler function
      const uncaughtHandler = (process.on as jest.Mock).mock.calls.find(
        call => call[0] === 'uncaughtException'
      )[1];
      
      // Call the handler with an error
      const testError = new Error('Test uncaught exception');
      uncaughtHandler(testError);
      
      // Verify error logging and cleanup
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Uncaught exception: Test uncaught exception'),
        expect.objectContaining({ prefix: 'Server' })
      );
      expect(mockCleanup).toHaveBeenCalledWith(1);
    });
    
    test('unhandledRejection handler should log and call cleanup', () => {
      // Create mock cleanup function
      const mockCleanup = jest.fn();
      
      // Setup handler
      setupErrorHandlers(mockCleanup);
      
      // Get the handler function
      const rejectionHandler = (process.on as jest.Mock).mock.calls.find(
        call => call[0] === 'unhandledRejection'
      )[1];
      
      // Call the handler with an error
      const testError = new Error('Test unhandled rejection');
      rejectionHandler(testError);
      
      // Verify error logging and cleanup
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled rejection: Test unhandled rejection'),
        expect.objectContaining({ prefix: 'Server' })
      );
      expect(mockCleanup).toHaveBeenCalledWith(1);
    });
    
    test('handleError should log error and exit process', () => {
      // Call handleError
      expect(() => {
        handleError(new Error('Test error'), 'Test Context');
      }).not.toThrow();
      
      // Verify error logging and process exit
      expect(logger.error).toHaveBeenCalledWith(
        'Test Context: Test error',
        expect.objectContaining({ prefix: 'Server' })
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('Signal Handler', () => {
    test('setupSignalHandlers should register handlers for termination signals', () => {
      // Create mock cleanup function
      const mockCleanup = jest.fn();
      
      // Call setupSignalHandlers
      setupSignalHandlers(mockCleanup);
      
      // Verify event handlers were registered for all signals
      expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGUSR1', expect.any(Function));
      expect(process.on).toHaveBeenCalledWith('SIGUSR2', expect.any(Function));
    });
    
    test('signal handlers should log and call cleanup', () => {
      // Create mock cleanup function
      const mockCleanup = jest.fn();
      
      // Setup handler
      setupSignalHandlers(mockCleanup);
      
      // Get the handler function for SIGINT
      const sigintHandler = (process.on as jest.Mock).mock.calls.find(
        call => call[0] === 'SIGINT'
      )[1];
      
      // Call the handler
      sigintHandler();
      
      // Verify logging and cleanup
      expect(logger.info).toHaveBeenCalledWith(
        'Received SIGINT signal',
        expect.objectContaining({ prefix: 'Server' })
      );
      expect(mockCleanup).toHaveBeenCalledWith(0);
    });
  });
}); 