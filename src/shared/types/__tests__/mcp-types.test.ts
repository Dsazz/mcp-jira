import { McpResponse, createSuccessResponse, createErrorResponse } from '../mcp-types';

describe('MCP Types', () => {
  describe('createSuccessResponse', () => {
    it('should create a properly formatted success response', () => {
      const testMessage = 'test success message';
      const response = createSuccessResponse(testMessage);
      
      expect(response).toEqual({
        content: [{
          type: 'text',
          text: testMessage
        }]
      });
      
      expect(response.isError).toBeUndefined();
    });
  });
  
  describe('createErrorResponse', () => {
    it('should create a properly formatted error response', () => {
      const testMessage = 'test error message';
      const response = createErrorResponse(testMessage);
      
      expect(response).toEqual({
        content: [{
          type: 'text',
          text: testMessage
        }],
        isError: true
      });
      
      expect(response.isError).toBe(true);
    });
  });
}); 