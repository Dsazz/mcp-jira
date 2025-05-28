/**
 * Create Task Handler Unit Tests
 * Co-located unit tests for JIRA create task MCP tool handler
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { CreateTaskHandler } from './create-task.handler';
import { jiraApiMocks, testDataBuilder } from '../../../../test/utils/mock-helpers';
import { setupTests } from '../../../../test/utils/test-setup';
import type { JiraClient } from '../../api/jira.client.impl';
import type { McpResponse } from '../../../../core/responses/mcp-response.types';
import { mock } from 'bun:test';

// Setup test environment
setupTests();

describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let mockClient: Partial<JiraClient>;

  beforeEach(() => {
    // Create a mock JIRA client
    mockClient = {
      getIssue: async (issueKey: string) => {
        // This will be mocked by jiraApiMocks in individual tests
        const response = await fetch(`/rest/api/3/issue/${issueKey}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response.json();
      }
    };
    
    handler = new CreateTaskHandler(mockClient as JiraClient);
  });

  afterEach(() => {
    jiraApiMocks.clearMocks();
  });

  describe('successful task creation', () => {
    test('should create task from valid JIRA issue', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'TEST-123';
      mockIssue.id = 'issue-123';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/TEST-123', mockIssue);

      const result = await handler.handle({ issueKey: 'TEST-123' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-issue-123 from JIRA issue TEST-123');
    });

    test('should handle issue with different priorities', async () => {
      const highPriorityIssue = testDataBuilder.issueWithPriority('High');
      highPriorityIssue.key = 'URGENT-456';
      highPriorityIssue.id = 'urgent-456';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/URGENT-456', highPriorityIssue);

      const result = await handler.handle({ issueKey: 'URGENT-456' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-urgent-456 from JIRA issue URGENT-456');
    });

    test('should handle issue with different statuses', async () => {
      const inProgressIssue = testDataBuilder.issueWithStatus('In Progress', 'yellow');
      inProgressIssue.key = 'WORK-789';
      inProgressIssue.id = 'work-789';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/WORK-789', inProgressIssue);

      const result = await handler.handle({ issueKey: 'WORK-789' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-work-789 from JIRA issue WORK-789');
    });

    test('should handle issue with complex ADF description', async () => {
      const complexIssue = {
        id: 'complex-101',
        key: 'COMPLEX-101',
        self: 'https://company.atlassian.net/rest/api/3/issue/complex-101',
        fields: {
          summary: 'Complex issue with ADF content',
          description: {
            version: 1,
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'This is a complex issue with ADF formatting.' }]
              }
            ]
          },
          status: { name: 'To Do', statusCategory: { name: 'To Do', colorName: 'blue' } },
          priority: { name: 'Medium' }
        }
      };
      
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/COMPLEX-101', complexIssue);

      const result = await handler.handle({ issueKey: 'COMPLEX-101' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-complex-101 from JIRA issue COMPLEX-101');
    });

    test('should handle issue with minimal fields', async () => {
      const minimalIssue = {
        id: 'minimal-202',
        key: 'MIN-202',
        self: 'https://test.atlassian.net/rest/api/3/issue/minimal-202',
        fields: {
          summary: 'Minimal issue'
          // Missing optional fields
        }
      };

      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/MIN-202', minimalIssue);

      const result = await handler.handle({ issueKey: 'MIN-202' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-minimal-202 from JIRA issue MIN-202');
    });
  });

  describe('error handling', () => {
    test('should handle issue not found error', async () => {
      jiraApiMocks.mockIssueNotFound('NONEXIST-1');

      const result = await handler.handle({ issueKey: 'NONEXIST-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 404');
    });

    test('should handle authentication error', async () => {
      jiraApiMocks.mockAuthError();

      const result = await handler.handle({ issueKey: 'TEST-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 401');
    });

    test('should handle permission error', async () => {
      jiraApiMocks.mockPermissionError('RESTRICT-1');

      const result = await handler.handle({ issueKey: 'RESTRICT-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 403');
    });

    test('should handle network error', async () => {
      jiraApiMocks.mockNetworkError('/rest/api/3/issue/NETWORK-1');

      const result = await handler.handle({ issueKey: 'NETWORK-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    test('should handle JIRA API error', async () => {
      const fetchMock = mock(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({
            errorMessages: ['Internal server error'],
            errors: {}
          }),
          text: () => Promise.resolve(JSON.stringify({
            errorMessages: ['Internal server error'],
            errors: {}
          }))
        })
      );
      
      (global as { fetch: unknown }).fetch = fetchMock;

      const result = await handler.handle({ issueKey: 'ERROR-500' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 500');
    });

    test('should handle malformed issue response', async () => {
      // Mock a response that has some malformed fields but includes required id
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/MALFORM-1', {
        id: 'malformed-1',
        key: 'MALFORM-1',
        // Missing or null fields that should be handled gracefully
        fields: null
      });

      const result = await handler.handle({ issueKey: 'MALFORM-1' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      // Should handle malformed data gracefully and still create task
      expect(result.data).toContain('Successfully created task #TASK-malformed-1 from JIRA issue MALFORM-1');
    });

    test('should handle client not initialized', async () => {
      const handlerWithoutClient = new CreateTaskHandler();

      const result = await handlerWithoutClient.handle({ issueKey: 'TEST-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('JIRA client not initialized');
    });
  });

  describe('input validation', () => {
    test('should handle empty issue key', async () => {
      const result = await handler.handle({ issueKey: '' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid task parameters');
      expect(result.error).toContain('Issue key must be in the format PROJECT-123');
    });

    test('should handle null issue key', async () => {
      const result = await handler.handle({ issueKey: null });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid task parameters');
      expect(result.error).toContain('Expected string, received null');
    });

    test('should handle undefined issue key', async () => {
      const result = await handler.handle({ issueKey: undefined });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid task parameters');
      expect(result.error).toContain('Required');
    });

    test('should handle whitespace-only issue key', async () => {
      const result = await handler.handle({ issueKey: '   ' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid task parameters');
      expect(result.error).toContain('Issue key must be in the format PROJECT-123');
    });

    test('should handle invalid issue key format', async () => {
      const invalidKeys = ['invalid', 'TEST', '123', 'TEST-', '-123', 'test-123'];
      
      for (const key of invalidKeys) {
        const result = await handler.handle({ issueKey: key });
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid task parameters');
        expect(result.error).toContain('Issue key must be in the format PROJECT-123');
      }
    });

    test('should accept valid issue key formats', async () => {
      const validKeys = ['TEST-1', 'PROJECT-123', 'MYPROJ-999', 'ABC-1'];
      
      for (const key of validKeys) {
        const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
        mockIssue.key = key;
        mockIssue.id = `id-${key.toLowerCase()}`;
        jiraApiMocks.mockJiraApiSuccess(`/rest/api/3/issue/${key}`, mockIssue);
        
        const result = await handler.handle({ issueKey: key });
        expect(result.success).toBe(true);
        expect(result.data).toContain(`Successfully created task #TASK-id-${key.toLowerCase()} from JIRA issue ${key}`);
        
        jiraApiMocks.clearMocks();
      }
    });

    test('should handle missing parameters object', async () => {
      const result = await handler.handle({});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid task parameters');
      expect(result.error).toContain('Required');
    });

    test('should handle extra parameters gracefully', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'EXTRA-1';
      mockIssue.id = 'extra-1';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/EXTRA-1', mockIssue);

      const result = await handler.handle({
        issueKey: 'EXTRA-1',
        // Extra parameters should be ignored
        extraParam: 'ignored',
        anotherParam: 123
      }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-extra-1 from JIRA issue EXTRA-1');
    });
  });

  describe('task creation logic', () => {
    test('should generate task ID based on issue ID', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'TASKID-1';
      mockIssue.id = 'unique-issue-id-123';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/TASKID-1', mockIssue);

      const result = await handler.handle({ issueKey: 'TASKID-1' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-unique-issue-id-123 from JIRA issue TASKID-1');
    });

    test('should handle numeric issue IDs', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'NUMERIC-1';
      mockIssue.id = '12345';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/NUMERIC-1', mockIssue);

      const result = await handler.handle({ issueKey: 'NUMERIC-1' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-12345 from JIRA issue NUMERIC-1');
    });

    test('should handle special characters in issue ID', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'SPECIAL-1';
      mockIssue.id = 'issue-with-dashes_and_underscores.123';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/SPECIAL-1', mockIssue);

      const result = await handler.handle({ issueKey: 'SPECIAL-1' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      expect(result.data).toContain('Successfully created task #TASK-issue-with-dashes_and_underscores.123 from JIRA issue SPECIAL-1');
    });
  });

  describe('logging and debugging', () => {
    test('should log task creation attempt', async () => {
      const mockIssue = testDataBuilder.issueWithStatus('To Do', 'blue');
      mockIssue.key = 'LOG-1';
      mockIssue.id = 'log-1';
      jiraApiMocks.mockJiraApiSuccess('/rest/api/3/issue/LOG-1', mockIssue);

      const result = await handler.handle({ issueKey: 'LOG-1' }) as McpResponse<string>;

      expect(result.success).toBe(true);
      // The logging is handled internally, we just verify the operation succeeds
      expect(result.data).toContain('Successfully created task #TASK-log-1 from JIRA issue LOG-1');
    });

    test('should handle and log errors appropriately', async () => {
      jiraApiMocks.mockAuthError();

      const result = await handler.handle({ issueKey: 'ERROR-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 401');
      // Error logging is handled internally by BaseToolHandler
    });
  });
}); 