import { startServer } from '../index';
import * as lifecycle from '../lifecycle';
import { logger } from '../../shared/logging';

// Mock the features so we don't need to import them
jest.mock('../../features/jira', () => ({
  initializeJiraFeature: jest.fn()
}));

jest.mock('../../features/system-time', () => ({
  registerSystemTimeTools: jest.fn()
}));

// Mock the lifecycle module
jest.mock('../lifecycle');
// Mock the logging module
jest.mock('../../shared/logging');

describe('Server Index', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('startServer should successfully initialize the server', async () => {
    // Mock successful initialization
    const initializeServerMock = jest.spyOn(lifecycle, 'initializeServer').mockResolvedValue();

    // Call the function
    await startServer();

    // Check that initializeServer was called exactly once
    expect(initializeServerMock).toHaveBeenCalledTimes(1);
    // Verify no logs were made (success path)
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('startServer should handle errors and log them', async () => {
    // Mock process.exit to prevent test from exiting
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    
    // Mock a failed initialization
    const testError = new Error('Test initialization error');
    jest.spyOn(lifecycle, 'initializeServer').mockRejectedValue(testError);

    // Call the function
    await startServer();

    // Check that the error was logged
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to start MCP server: Test initialization error'),
      expect.objectContaining({ prefix: 'Server' })
    );
    
    // Check that process.exit was called with status code 1
    expect(mockExit).toHaveBeenCalledWith(1);
    
    // Restore the original process.exit
    mockExit.mockRestore();
  });
}); 