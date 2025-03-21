import { CreateTaskTool } from '../../tools/create-task/create-task.tool';
import { api } from '../../api/client';
import { IssueError } from '../../errors/api-errors';

// Mock the API client
jest.mock('../../api/client', () => ({
  api: {
    createTaskFromIssue: jest.fn(),
    getIssue: jest.fn().mockResolvedValue({
      key: 'TEST-123',
      id: '1000',
      fields: {
        summary: 'Test issue summary',
        status: {
          name: 'Open'
        }
      }
    })
  }
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
        status: {
          name: 'Open'
        }
      }
    });
  });
  
  it('should create a task from an issue successfully', async () => {
    // Arrange
    const params = { issueKey: 'TEST-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(mockGetIssue).toHaveBeenCalledWith('TEST-123', expect.any(Array));
    expect(result).toHaveProperty('content');
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Task created from issue TEST-123');
  });
  
  it('should handle missing issueKey parameter', async () => {
    // Arrange
    const params = { };
    
    // Act
    const result = await tool.handler(params as any);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Invalid parameters');
  });
  
  it('should handle API errors during task creation', async () => {
    // Arrange
    mockGetIssue.mockRejectedValue(
      new IssueError('Cannot retrieve issue data', 'TEST-123')
    );
    const params = { issueKey: 'TEST-123' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0].text).toContain('Cannot retrieve issue data');
  });
  
  it('should include issue details in response', async () => {
    // Arrange
    mockGetIssue.mockResolvedValue({
      key: 'TEST-789',
      id: '3000',
      self: 'https://jira.example.com/rest/api/2/issue/3000',
      fields: {
        summary: 'Test issue with link',
        status: {
          name: 'Open'
        }
      }
    });
    const params = { issueKey: 'TEST-789' };
    
    // Act
    const result = await tool.handler(params);
    
    // Assert
    expect(result).toHaveProperty('content');
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Task created from issue TEST-789');
    expect(result.content[0].text).toContain('Test issue with link');
  });
}); 