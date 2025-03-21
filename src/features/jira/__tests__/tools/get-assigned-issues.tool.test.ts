// Mock config before importing the module
jest.mock('../../config/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    username: 'test-user',
    apiToken: 'test-token',
    host: 'https://test-jira.atlassian.net',
  }),
  logConfigStatus: jest.fn()
}));

// Mock the API client directly
jest.mock('../../api/client', () => ({
  api: {
    getAssignedIssues: jest.fn()
  }
}));

// Mock the formatters
jest.mock('../../formatters/issue-list.formatter', () => ({
  IssueListFormatter: jest.fn().mockImplementation(() => ({
    format: jest.fn().mockReturnValue('Formatted 2 issues')
  }))
}));

// Mock the logger
jest.mock('../../../../shared/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

import { GetAssignedIssuesTool } from '../../tools/get-assigned-issues/get-assigned-issues.tool';
import { api } from '../../api/client';
import { ServerError } from '../../errors/api-errors';
import { Issue } from '../../api/types';
import { expectSuccessResponse, expectErrorResponse } from '../__mocks__/test-utils';
import { testIssues } from '../__mocks__/api.mock';

describe('GetAssignedIssuesTool', () => {
  let tool: GetAssignedIssuesTool;
  const mockGetAssignedIssues = api.getAssignedIssues as jest.Mock;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up default mock responses
    mockGetAssignedIssues.mockResolvedValue(testIssues.list);
    
    // Create a new instance of the tool
    tool = new GetAssignedIssuesTool();
  });
  
  it('should retrieve and format assigned issues successfully', async () => {
    // Act
    const result = await tool.handler({});
    
    // Assert
    expect(mockGetAssignedIssues).toHaveBeenCalledWith(expect.any(Array));
    expectSuccessResponse(result, 'Formatted 2 issues');
  });
  
  it('should handle case with no assigned issues', async () => {
    // Arrange
    mockGetAssignedIssues.mockResolvedValue([]);
    
    // Act
    const result = await tool.handler({});
    
    // Assert
    expect(mockGetAssignedIssues).toHaveBeenCalled();
    expectSuccessResponse(result, 'No issues are currently assigned to you.');
  });
  
  it('should handle API errors', async () => {
    // Arrange
    mockGetAssignedIssues.mockRejectedValue(new ServerError('Server error'));
    
    // Act
    const result = await tool.handler({});
    
    // Assert
    expectErrorResponse(result, 'SERVER_ERROR', 'Server error');
  });
  
  it('should pass the correct fields to the API', async () => {
    // Act
    await tool.handler({});
    
    // Assert
    expect(mockGetAssignedIssues).toHaveBeenCalledWith(expect.arrayContaining([
      'summary', 'status', 'updated'
    ]));
  });
}); 