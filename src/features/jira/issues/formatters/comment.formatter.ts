import type { StringFormatter } from "@features/jira/shared";
/**
 * Comment formatter
 */
import { ADFToMarkdownParser } from "@features/jira/shared/parsers/adf.parser";
import type { Comment } from "../models/comment.models";

export class CommentFormatter implements StringFormatter<Comment> {
  private readonly adfParser: ADFToMarkdownParser;

  constructor() {
    this.adfParser = new ADFToMarkdownParser();
  }

  format(comment: Comment): string {
    const sections: string[] = [];

    // Comment header
    sections.push(`**Comment ID:** ${comment.id}`);

    // Author information
    if (comment.author) {
      const authorInfo = [
        `**Author:** ${comment.author.displayName || comment.author.accountId}`,
      ];
      if (comment.author.emailAddress) {
        authorInfo.push(`**Email:** ${comment.author.emailAddress}`);
      }
      sections.push(authorInfo.join(" | "));
    }

    // Timestamps
    const timeInfo = [`**Created:** ${comment.created}`];
    if (comment.updated && comment.updated !== comment.created) {
      timeInfo.push(`**Updated:** ${comment.updated}`);
    }
    sections.push(timeInfo.join(" | "));

    // Comment body
    if (comment.body) {
      sections.push("**Content:**");
      if (typeof comment.body === "string") {
        sections.push(comment.body);
      } else {
        // Handle ADF (Atlassian Document Format) content using the ADF parser
        const parsedContent = this.adfParser.parse(comment.body);
        sections.push(parsedContent || "_No content_");
      }
    }

    // Visibility
    if (comment.visibility) {
      sections.push(
        `**Visibility:** ${comment.visibility.type} - ${comment.visibility.value}`,
      );
    }

    return sections.join("\n");
  }
}
