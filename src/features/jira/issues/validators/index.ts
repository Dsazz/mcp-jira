/**
 * Issue validators exports
 */

import { ValidationError } from "@core/errors";
import type { GetCommentsOptions } from "../models/comment.models";

export interface IssueCommentValidator {
  validateGetComments(options: GetCommentsOptions): void;
}

export class IssueCommentValidatorImpl implements IssueCommentValidator {
  validateGetComments(options: GetCommentsOptions): void {
    if (!options.issueKey || typeof options.issueKey !== "string") {
      throw new ValidationError("Invalid issue key");
    }
  }
}
