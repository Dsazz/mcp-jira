import { Logger, LogLevel, LogOptions } from '../logger';

// Mock process.stderr.write
const mockStdErrWrite = jest.fn();
const originalStdErrWrite = process.stderr.write;

beforeEach(() => {
  // Setup the mock for process.stderr.write
  process.stderr.write = mockStdErrWrite as any;
  jest.useFakeTimers();

  // Set a fixed date for tests
  jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
});

afterEach(() => {
  // Restore original stderr.write and reset mock
  process.stderr.write = originalStdErrWrite;
  mockStdErrWrite.mockReset();
  jest.useRealTimers();
});

describe('Logger', () => {
  describe('constructor', () => {
    it('should create a logger with no context', () => {
      const logger = new Logger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create a logger with context', () => {
      const logger = new Logger('test-context');
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('withContext', () => {
    it('should return a new logger with the specified context', () => {
      const baseLogger = new Logger();
      const contextLogger = baseLogger.withContext('test-context');
      
      expect(contextLogger).toBeInstanceOf(Logger);
      expect(contextLogger).not.toBe(baseLogger);
      
      // Test that the context is applied
      contextLogger.info('test message');
      expect(mockStdErrWrite).toHaveBeenCalledWith(
        expect.stringContaining('[test-context]')
      );
    });

    it('should create a new logger with a context, replacing any parent context', () => {
      // Based on the implementation, it appears withContext() replaces rather than extends
      const parentLogger = new Logger('parent');
      const childLogger = parentLogger.withContext('child');
      
      childLogger.info('test message');
      
      // Check if the child context is present
      expect(mockStdErrWrite).toHaveBeenCalledWith(
        expect.stringContaining('[child]')
      );
      
      // The log should NOT contain the parent context, as withContext replaces it
      const logOutput = mockStdErrWrite.mock.calls[0][0] as string;
      expect(logOutput).not.toContain('parent');
    });
  });

  describe('log methods', () => {
    let logger: Logger;
    
    beforeEach(() => {
      logger = new Logger('test');
    });

    describe('debug', () => {
      beforeEach(() => {
        // Store and mock NODE_ENV for debug tests
        process.env.NODE_ENV = 'development';
      });

      it('should log debug messages in development mode', () => {
        logger.debug('debug message');
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG]')
        );
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('debug message')
        );
      });

      it('should format object messages as JSON', () => {
        const obj = { key: 'value' };
        logger.debug(obj);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining(JSON.stringify(obj, null, 2))
        );
      });

      it('should not log in production mode', () => {
        process.env.NODE_ENV = 'production';
        logger.debug('debug message');
        expect(mockStdErrWrite).not.toHaveBeenCalled();
      });
    });

    describe('info', () => {
      it('should log info messages', () => {
        logger.info('info message');
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('[INFO]')
        );
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('info message')
        );
      });

      it('should format object messages as JSON', () => {
        const obj = { key: 'value' };
        logger.info(obj);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining(JSON.stringify(obj, null, 2))
        );
      });
    });

    describe('warn', () => {
      it('should log warning messages', () => {
        logger.warn('warn message');
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('[WARN]')
        );
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('warn message')
        );
      });

      it('should format object messages as JSON', () => {
        const obj = { key: 'value' };
        logger.warn(obj);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining(JSON.stringify(obj, null, 2))
        );
      });
    });

    describe('error', () => {
      it('should log error messages', () => {
        logger.error('error message');
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR]')
        );
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('error message')
        );
      });

      it('should log Error objects with stack trace', () => {
        const error = new Error('test error');
        logger.error(error);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining(error.stack || error.message)
        );
      });

      it('should format object messages as JSON', () => {
        const obj = { key: 'value' };
        logger.error(obj);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining(JSON.stringify(obj, null, 2))
        );
      });
    });

    describe('options handling', () => {
      it('should include prefix in log messages when provided', () => {
        const options: LogOptions = { prefix: 'test-prefix' };
        logger.info('test message', options);
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('[test:test-prefix]')
        );
      });

      it('should format timestamps correctly', () => {
        logger.info('test message');
        expect(mockStdErrWrite).toHaveBeenCalledWith(
          expect.stringContaining('2023-01-01T12:00:00.000Z')
        );
      });
    });
  });
}); 