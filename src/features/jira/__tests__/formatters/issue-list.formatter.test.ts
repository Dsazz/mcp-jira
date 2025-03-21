import { IssueListFormatter } from '../../formatters/issue-list.formatter';
import { testIssues } from '../__mocks__';
import { Issue } from '../../api/types';

describe('IssueListFormatter', () => {
  let formatter: IssueListFormatter;
  
  beforeEach(() => {
    formatter = new IssueListFormatter();
  });
  
  it('should format a list of issues', () => {
    // Act
    const result = formatter.format(testIssues.list);
    
    // Assert
    expect(result).toContain('# Your Assigned Issues');
    expect(result).toContain('TEST-101');
    expect(result).toContain('List issue 1');
    expect(result).toContain('Open');
    expect(result).toContain('TEST-102');
    expect(result).toContain('List issue 2');
    expect(result).toContain('In Progress');
  });
  
  it('should handle empty issue list', () => {
    // Arrange
    const issues: Issue[] = [];
    
    // Act
    const result = formatter.format(issues);
    
    // Assert
    expect(result).toContain('# Your Assigned Issues');
    expect(result).toContain('0 issue(s) assigned to you');
  });
  
  it('should format issues with minimal status information', () => {
    // Arrange
    const issues: Issue[] = [{
      key: 'TEST-789',
      id: '3000',
      fields: {
        summary: 'Issue with minimal status',
        status: {
          name: 'Unknown'
        },
        updated: '2023-01-03T12:00:00.000Z'
      }
    }];
    
    // Act
    const result = formatter.format(issues);
    
    // Assert
    expect(result).toContain('TEST-789');
    expect(result).toContain('Issue with minimal status');
    expect(result).toContain('Unknown');
  });
}); 