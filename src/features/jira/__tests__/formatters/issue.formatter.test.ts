import { IssueFormatter } from '../../formatters/issue.formatter';
import { Issue } from '../../api/types';

describe('IssueFormatter', () => {
  let formatter: IssueFormatter;
  
  beforeEach(() => {
    formatter = new IssueFormatter();
  });
  
  it('should format an issue with minimal fields', () => {
    // Arrange
    const issue: Issue = {
      key: 'TEST-123',
      id: '1000',
      fields: {
        summary: 'Test issue summary',
        status: {
          name: 'Open'
        }
      }
    };
    
    // Act
    const result = formatter.format(issue);
    
    // Assert
    expect(result).toContain('# TEST-123: Test issue summary');
    expect(result).toContain('**Status**: Open');
    expect(result).not.toContain('**Priority**');
    expect(result).not.toContain('**Assignee**');
  });
  
  it('should format an issue with all fields', () => {
    // Arrange
    const issue: Issue = {
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
    };
    
    // Act
    const result = formatter.format(issue);
    
    // Assert
    expect(result).toContain('# TEST-456: Full test issue');
    expect(result).toContain('**Status**: In Progress');
    expect(result).toContain('**Priority**: High');
    expect(result).toContain('**Assignee**: Test User');
    expect(result).toContain('## Description');
    expect(result).toContain('This is a test description');
    expect(result).toContain('## Labels');
    expect(result).toContain('test, unit-test');
    expect(result).toContain('## Dates');
    expect(result).toContain('**Created**:');
    expect(result).toContain('**Updated**:');
    expect(result).toContain('[View in JIRA](https://jira.example.com/browse/TEST-456)');
  });
  
  it('should handle missing description and dates', () => {
    // Arrange
    const issue: Issue = {
      key: 'TEST-789',
      id: '3000',
      fields: {
        summary: 'Simple issue',
        status: {
          name: 'Done'
        }
      }
    };
    
    // Act
    const result = formatter.format(issue);
    
    // Assert
    expect(result).toContain('# TEST-789: Simple issue');
    expect(result).toContain('**Status**: Done');
    expect(result).not.toContain('## Description');
    expect(result).not.toContain('## Dates');
  });
}); 