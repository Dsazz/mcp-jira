import { ApiClient } from '../../api/client';
import { 
  ApiError, 
  NotFoundError, 
  AuthorizationError, 
  ServerError 
} from '../../errors/api-errors';

// Mock the getConfig function from our actual config file
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

// Mock the fetch function
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockFetch = global.fetch as jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    apiClient = new ApiClient();
    
    // Mock successful fetch response
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );
  });
  
  describe('getIssue', () => {
    it('should fetch issue with correct URL and params', async () => {
      // Arrange
      const issueKey = 'TEST-123';
      const fields = ['summary', 'description'];
      
      // Act
      await apiClient.getIssue(issueKey, fields);
      
      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/issue/TEST-123?fields=summary%2Cdescription',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': expect.any(String)
          })
        })
      );
    });
    
    it('should handle error responses correctly', async () => {
      // Arrange
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () => Promise.resolve({
            errorMessages: ['Issue does not exist']
          })
        })
      );
      
      // Act & Assert
      await expect(apiClient.getIssue('NONEXISTENT-123'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
  
  describe('getAssignedIssues', () => {
    it('should call searchIssues with correct JQL', async () => {
      // Arrange
      const mockIssues = [{ id: '1', key: 'TEST-1', fields: { summary: 'Test' } }];
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            issues: mockIssues,
            total: 1,
            startAt: 0,
            maxResults: 50
          })
        })
      );
      
      // Act
      const result = await apiClient.getAssignedIssues();
      
      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://jira.example.com/rest/api/2/search',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('assignee = currentUser()')
        })
      );
      expect(result).toEqual(mockIssues);
    });
  });
  
  describe('error handling', () => {
    it('should throw AuthorizationError on 401', async () => {
      // Arrange
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: () => Promise.resolve({
            errorMessages: ['Authentication failed']
          })
        })
      );
      
      // Act & Assert
      await expect(apiClient.getIssue('TEST-123'))
        .rejects
        .toThrow(AuthorizationError);
    });
    
    it('should throw ServerError on 500', async () => {
      // Arrange
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({
            errorMessages: ['Server error']
          })
        })
      );
      
      // Act & Assert
      await expect(apiClient.getIssue('TEST-123'))
        .rejects
        .toThrow(ServerError);
    });
    
    it('should handle failed JSON parsing in error responses', async () => {
      // Arrange
      mockFetch.mockImplementation(() => 
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: () => Promise.reject(new Error('Invalid JSON'))
        })
      );
      
      // Act & Assert
      await expect(apiClient.getIssue('TEST-123'))
        .rejects
        .toThrow(ApiError);
    });
  });
}); 