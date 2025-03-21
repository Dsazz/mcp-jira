import { GetIssueTool } from '../../tools/get-issue/get-issue.tool';
import { api } from '../../api/client';
import { NotFoundError } from '../../errors/api-errors';

// Mock the API client
jest.mock('../../api/client', () => ({
  api: {
    getIssue: jest.fn()
  }
}));

// Mock the formatter
jest.mock('../../formatters/issue.formatter', () => {
  return {
    IssueFormatter: jest.fn().mockImplementation(() => ({
      format: jest.fn((issue) => `Formatted ${issue.key}: ${issue.fields.summary}`)
    }))
  };
});

// Mock the logger
jest.mock('../../../../shared/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('GetIssueTool', () => {
  let tool: GetIssueTool;
  const mockGetIssue = api.getIssue as jest.Mock;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance of the tool
    tool = new GetIssueTool();
    
    // Set up default mock responses
    mockGetIssue.mockResolvedValue({
      key: 'TEST-123',
      id: '1000',
      fields: {
        summary: 'Test issue summary',
        status: {
          name: 'Open'
        }
      }
    });
  });
  
  it('should retrieve and format an issue successfully', async () => {
    // Arrange
    const params = { issueKey: 'TEST-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(mockGetIssue).toHaveBeenCalledWith('TEST-123', expect.any(Array));
    expect(result).toEqual({
      content: [{ 
        type: 'text', 
        text: 'Formatted TEST-123: Test issue summary'
      }]
    });
  });
  
  it('should throw an error when issueKey is missing', async () => {
    // Arrange
    const params = { };
    
    // Act
    const result = await tool.handler(params as any);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Invalid parameters');
  });
  
  it('should handle API errors', async () => {
    // Arrange
    mockGetIssue.mockRejectedValue(new NotFoundError('Issue does not exist'));
    const params = { issueKey: 'NONEXISTENT-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result).toHaveProperty('errorCode', 'ISSUE_NOT_FOUND');
    expect(result.content[0].text).toContain('Issue does not exist');
  });
  
  it('should pass the correct fields to the API', async () => {
    // Arrange
    const params = { issueKey: 'TEST-456' };
    
    // Act
    await tool.handler(params);
    
    // Assert
    expect(mockGetIssue).toHaveBeenCalledWith('TEST-456', expect.arrayContaining([
      'summary', 'description', 'status', 'priority', 'assignee', 'created', 'updated', 'labels'
    ]));
  });
}); 