/**
 * Handler for Get Issue Comments use case
 */

import type { McpResponse } from "@core/responses/mcp-response.types";
import type { Comment, GetCommentsOptions } from "../../models/comment.models";
import type { GetIssueCommentsUseCase } from "../../use-cases/get-issue-comments.use-case";

export class GetIssueCommentsHandler {
  constructor(private readonly getIssueCommentsUseCase: GetIssueCommentsUseCase) {}

  async execute(options: GetCommentsOptions): Promise<McpResponse<Comment[], string>> {
    try {
      const comments = await this.getIssueCommentsUseCase.execute(options);
      return { status: "success", data: comments };
    } catch (error) {
      return { 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }
}
