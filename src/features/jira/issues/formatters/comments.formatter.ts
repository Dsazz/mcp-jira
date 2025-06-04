/**
 * Comments Formatter
 *
 * Formats JIRA comments for display
 */
import type { Comment } from "@features/jira/issues/models/comment.models";
import type { Formatter } from "@features/jira/shared";
import { parseADF } from "@features/jira/shared/parsers/adf.parser";

/**
 * Interface for comments formatting context
 */
export interface CommentsContext {
  issueKey: string;
  totalComments: number;
  maxDisplayed?: number;
}

/**
 * Formats JIRA issue comments into structured markdown
 * Implements the Formatter interface for Comment arrays with context
 */
export class CommentsFormatter
  implements
    Formatter<{ comments: Comment[]; context: CommentsContext }, string>
{
  /**
   * Format comments array to structured markdown
   */
  format(data: { comments: Comment[]; context: CommentsContext }): string {
    const { comments, context } = data;

    if (comments.length === 0) {
      return `# 💬 Comments for ${context.issueKey}\n\n**No comments found**\n\nThis issue doesn't have any comments yet.`;
    }

    // Header with summary information
    let markdown = `# 💬 Comments for ${context.issueKey}\n\n`;

    // Add summary line with total and latest info
    const latestComment = comments[comments.length - 1];
    const latestDate = latestComment
      ? this.formatDate(latestComment.created)
      : "";

    markdown += `**Total:** ${context.totalComments} comment${context.totalComments !== 1 ? "s" : ""}`;
    if (context.maxDisplayed && context.maxDisplayed < context.totalComments) {
      markdown += ` | **Showing:** ${context.maxDisplayed}`;
    }
    if (latestDate) {
      markdown += ` | **Latest:** ${latestDate}`;
    }
    markdown += "\n\n---\n\n";

    // Format each comment
    comments.forEach((comment, index) => {
      markdown += this.formatSingleComment(comment, index + 1);

      // Add separator between comments (but not after the last one)
      if (index < comments.length - 1) {
        markdown += "\n---\n\n";
      }
    });

    // Add navigation help if there are more comments than displayed
    if (context.maxDisplayed && context.maxDisplayed < context.totalComments) {
      const remainingComments = context.totalComments - context.maxDisplayed;
      markdown += `\n\n**Navigation:** Use \`get_issue_comments ${context.issueKey} maxComments:${context.maxDisplayed + 10}\` to see ${remainingComments} more comment${remainingComments !== 1 ? "s" : ""}.`;
    }

    return markdown;
  }

  /**
   * Format a single comment to markdown
   */
  private formatSingleComment(comment: Comment, commentNumber: number): string {
    const author = comment.author?.displayName || "Unknown User";
    const createdDate = this.formatDate(comment.created);

    // Comment header with number, author, and date
    let commentMarkdown = "## ";

    // Add internal comment indicator if applicable
    if (this.isInternalComment(comment)) {
      commentMarkdown += "🔒 ";
    }

    commentMarkdown += `Comment #${commentNumber} • ${author} • ${createdDate}\n\n`;

    // Add edit information if comment was updated
    if (comment.updated && comment.updated !== comment.created) {
      const updatedDate = this.formatDate(comment.updated);
      const updateAuthor = comment.updateAuthor?.displayName || author;
      commentMarkdown += `_Last edited: ${updatedDate}`;
      if (updateAuthor !== author) {
        commentMarkdown += ` by ${updateAuthor}`;
      }
      commentMarkdown += "_\n\n";
    }

    // Add internal comment visibility note
    if (this.isInternalComment(comment)) {
      commentMarkdown += "_Internal comment - restricted visibility_\n\n";
    }

    // Parse and add comment body content
    if (comment.body) {
      const bodyText = parseADF(comment.body);
      commentMarkdown += bodyText.trim() || "_No content_";
    } else {
      commentMarkdown += "_No content_";
    }

    return commentMarkdown;
  }

  /**
   * Check if a comment is internal/restricted
   */
  private isInternalComment(comment: Comment): boolean {
    // Check visibility restrictions
    if (comment.visibility) {
      return true;
    }

    // Check JSD public flag (false means internal)
    if (comment.jsdPublic === false) {
      return true;
    }

    return false;
  }

  /**
   * Format date string to human-readable format
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  }
}
