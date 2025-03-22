import { registerFeatures } from '../register';
import { logger as mcpLogger } from '../../shared/logging';

// Mock dependencies
jest.mock('../../shared/logging');
// Mock the feature imports in the register.ts file
jest.mock('../../features/system-time', () => ({
  registerSystemTimeTools: jest.fn()
}));
jest.mock('../../features/jira', () => ({
  initializeJiraFeature: jest.fn()
}));

describe('Server Register', () => {
  let mockServer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock server
    mockServer = {
      registerTool: jest.fn(),
      registerFeature: jest.fn()
    };
  });

  test('registerFeatures should register all features successfully', async () => {
    // Call registerFeatures
    await registerFeatures(mockServer);

    // Verify logs
    expect(mcpLogger.info).toHaveBeenCalledWith(
      'Registering features...',
      expect.objectContaining({ prefix: 'Server' })
    );
    expect(mcpLogger.info).toHaveBeenCalledWith(
      'Features registered successfully',
      expect.objectContaining({ prefix: 'Server' })
    );

    // Verify feature registration - use imports from the mocked modules
    const { registerSystemTimeTools } = require('../../features/system-time');
    const { initializeJiraFeature } = require('../../features/jira');
    
    expect(registerSystemTimeTools).toHaveBeenCalledWith(mockServer);
    expect(initializeJiraFeature).toHaveBeenCalledWith(mockServer);
  });

  test('registerFeatures should handle and log errors', async () => {
    // Get the mocked function
    const { registerSystemTimeTools } = require('../../features/system-time');
    
    // Setup mock for a feature that fails to register
    const testError = new Error('Feature registration error');
    registerSystemTimeTools.mockImplementation(() => {
      throw testError;
    });

    // Call registerFeatures and expect it to throw
    await expect(registerFeatures(mockServer)).rejects.toThrow(testError);

    // Verify error log
    expect(mcpLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to register features: Feature registration error'),
      expect.objectContaining({ prefix: 'Server' })
    );
  });
}); 