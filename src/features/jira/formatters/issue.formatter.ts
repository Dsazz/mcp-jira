/**
 * Formatter for JIRA issues to markdown
 */
import { Issue } from '../api/types';
import { Formatter } from './formatter.interface';

/**
 * Formats a single JIRA issue into markdown
 * Implements the Formatter interface for Issue objects
 */
export class IssueFormatter implements Formatter<Issue> {
  /**
   * Format an issue to markdown
   */
  format(issue: Issue): string {
    // Build basic issue information
    let markdown = `# ${issue.key}: ${issue.fields.summary}\n\n`;
    
    // Add status and priority if available
    const metaItems: string[] = [];
    
    if (issue.fields.status) {
      metaItems.push(`**Status**: ${issue.fields.status.name}`);
    }
    
    if (issue.fields.priority) {
      metaItems.push(`**Priority**: ${issue.fields.priority.name}`);
    }
    
    if (issue.fields.assignee) {
      metaItems.push(`**Assignee**: ${issue.fields.assignee.displayName}`);
    }
    
    if (metaItems.length > 0) {
      markdown += metaItems.join(' | ') + '\n\n';
    }
    
    // Add description if available
    if (issue.fields.description) {
      markdown += `## Description\n\n${issue.fields.description}\n\n`;
    }
    
    // Add labels if available
    if (issue.fields.labels && issue.fields.labels.length > 0) {
      markdown += `## Labels\n\n${issue.fields.labels.join(', ')}\n\n`;
    }
    
    // Add dates
    if (issue.fields.created || issue.fields.updated) {
      markdown += '## Dates\n\n';
      
      if (issue.fields.created) {
        const created = new Date(issue.fields.created);
        markdown += `**Created**: ${created.toLocaleString()}\n\n`;
      }
      
      if (issue.fields.updated) {
        const updated = new Date(issue.fields.updated);
        markdown += `**Updated**: ${updated.toLocaleString()}\n\n`;
      }
    }
    
    // Add link to JIRA
    if (issue.self) {
      const baseUrl = issue.self.split('/rest/')[0];
      markdown += `---\n\n[View in JIRA](${baseUrl}/browse/${issue.key})`;
    }
    
    return markdown;
  }
} 