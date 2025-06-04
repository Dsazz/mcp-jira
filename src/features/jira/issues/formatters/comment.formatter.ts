/**
 * Comment formatter
 */
import type { Formatter } from "@features/jira/shared";
import type { Comment } from "../models/comment.models";

export class CommentFormatter implements Formatter<Comment, string> {
  format(comment: Comment) {
    return {
      id: comment.id,
      body: comment.body,
      author: comment.author
        ? {
            accountId: comment.author.accountId,
            displayName: comment.author.displayName,
            emailAddress: comment.author.emailAddress,
            active: comment.author.active,
            timeZone: comment.author.timeZone,
            accountType: comment.author.accountType,
          }
        : null,
      created: comment.created,
      updated: comment.updated,
    };
  }
}
