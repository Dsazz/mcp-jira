/**
 * Reusable mocks for formatters
 */
import { jest } from '@jest/globals';
import { Issue } from '../../api/types';

// Mock formatter functions
export const mockIssueFormat = jest.fn((issue: Issue) => 
  `Formatted ${issue.key}: ${issue.fields.summary}`
);

export const mockIssueListFormat = jest.fn((issues: Issue[]) => 
  `Formatted ${issues.length} issues`
);

// Setup mocks for the formatters
export const setupFormatterMocks = () => {
  // Mock issue formatter
  jest.mock('../../formatters/issue.formatter', () => {
    return {
      IssueFormatter: jest.fn().mockImplementation(() => ({
        format: mockIssueFormat
      }))
    };
  });
  
  // Mock issue list formatter
  jest.mock('../../formatters/issue-list.formatter', () => {
    return {
      IssueListFormatter: jest.fn().mockImplementation(() => ({
        format: mockIssueListFormat
      }))
    };
  });
};

// Helper to clear all formatter mocks
export const clearFormatterMocks = () => {
  mockIssueFormat.mockClear();
  mockIssueListFormat.mockClear();
}; 