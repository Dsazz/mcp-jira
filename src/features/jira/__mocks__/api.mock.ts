/**
 * Reusable mocks for the API client
 */
import { jest } from '@jest/globals';
import { Issue } from '../../api/types';

// Create mock API functions
export const mockGetIssue = jest.fn();
export const mockGetAssignedIssues = jest.fn();
export const mockCreateTaskFromIssue = jest.fn();
export const mockSearchIssues = jest.fn();

// Export mock API
export const mockApi = {
  getIssue: mockGetIssue,
  getAssignedIssues: mockGetAssignedIssues,
  createTaskFromIssue: mockCreateTaskFromIssue,
  searchIssues: mockSearchIssues
};

// Setup the mock for the API client module
export const setupApiMock = () => {
  jest.mock('../../api/client', () => ({
    api: mockApi
  }));
};

// Helper to clear all API mocks
export const clearApiMocks = () => {
  mockGetIssue.mockClear();
  mockGetAssignedIssues.mockClear();
  mockCreateTaskFromIssue.mockClear();
  mockSearchIssues.mockClear();
};

// Standard test issues that can be reused across tests
export const testIssues = {
  // Basic issue with minimal fields
  basic: {
    key: 'TEST-123',
    id: '1000',
    fields: {
      summary: 'Test issue summary',
      status: {
        name: 'Open'
      }
    }
  } as Issue,
  
  // Issue with all common fields
  complete: {
    key: 'TEST-456',
    id: '2000',
    self: 'https://jira.example.com/rest/api/2/issue/2000',
    fields: {
      summary: 'Full test issue',
      description: 'This is a test description',
      status: {
        name: 'In Progress'
      },
      priority: {
        name: 'High',
        id: 'high',
        iconUrl: 'high.png'
      },
      assignee: {
        displayName: 'Test User',
        emailAddress: 'test@example.com',
        accountId: 'test-user',
        active: true
      },
      created: '2023-01-01T12:00:00.000Z',
      updated: '2023-01-02T12:00:00.000Z',
      labels: ['test', 'unit-test'],
      project: {
        key: 'TEST',
        name: 'Test Project'
      }
    }
  } as Issue,
  
  // List of issues for testing list operations
  list: [
    {
      key: 'TEST-101',
      id: '1001',
      fields: {
        summary: 'List issue 1',
        status: { name: 'Open' },
        updated: '2023-01-01T12:00:00.000Z'
      }
    },
    {
      key: 'TEST-102',
      id: '1002',
      fields: {
        summary: 'List issue 2',
        status: { name: 'In Progress' },
        updated: '2023-01-02T12:00:00.000Z'
      }
    }
  ] as Issue[]
}; 