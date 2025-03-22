import { CreateTaskTool } from '../../tools/create-task/create-task.tool';
import { api } from '../../api/client';
import { NotFoundError } from '../../errors/api-errors';

// Mock the JiraConfig
jest.mock('../../config/jira-config', () => ({
  JiraConfig: jest.fn().mockImplementation(() => ({
    getApiToken: jest.fn().mockReturnValue('test-token'),
    host: 'https://jira.example.com',
    username: 'test-user',
    isValid: jest.fn().mockReturnValue(true),
    getDiagnostics: jest.fn().mockReturnValue({
      host: 'https://jira.example.com',
      username: 'test-user',
      hasApiToken: true,
      isValid: true
    })
  }))
}));

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

// Mock the validation
jest.mock('../../../../shared/validation/zod-validator');

// Mock the logger
jest.mock('../../../../shared/logging');

describe('CreateTaskTool', () => {
  let tool: CreateTaskTool;
  const mockGetIssue = api.getIssue as jest.Mock;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance of the tool
    tool = new CreateTaskTool();
    
    // Set up default mock responses
    mockGetIssue.mockResolvedValue({
      key: 'TEST-123',
      id: '1000',
      fields: {
        summary: 'Test issue summary',
        description: 'Test description',
        status: {
          name: 'Open'
        }
      }
    });
  });
  
  it('should create a task successfully', async () => {
    // Arrange
    const params = { issueKey: 'TEST-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(mockGetIssue).toHaveBeenCalledWith('TEST-123', expect.any(Array));
    expect(result).toEqual({
      content: [{ 
        type: 'text', 
        text: expect.stringContaining('Task created from issue TEST-123') 
      }]
    });
  });
  
  it('should handle missing issueKey parameter', async () => {
    // Arrange
    const params = { };
    
    // Act
    const result = await tool.handler(params as any);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Invalid task parameters');
  });
  
  it('should handle API errors during issue retrieval', async () => {
    // Arrange
    mockGetIssue.mockRejectedValue(new Error('Failed to retrieve issue'));
    const params = { issueKey: 'TEST-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Failed to retrieve issue');
  });
  
  it('should handle not found errors', async () => {
    // Arrange
    mockGetIssue.mockRejectedValue(new NotFoundError('Issue does not exist'));
    const params = { issueKey: 'TEST-789' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Issue does not exist');
  });
}); 