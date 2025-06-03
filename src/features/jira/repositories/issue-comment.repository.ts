import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type {
  Comment,
  CommentsResult,
  GetCommentsOptions,
} from "./comment.models";

/**
 * Repository interface for issue comment operations
 * Clear responsibility: managing issue comment data and operations
 */
export interface IssueCommentRepository {
  getIssueComments(
    issueKey: string,
    options?: GetCommentsOptions,
  ): Promise<Comment[]>;
}

/**
 * Implementation of IssueCommentRepository
 * Extracted from JiraClient god object - specialized for comment operations
 */
export class IssueCommentRepositoryImpl implements IssueCommentRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get comments for a specific issue
   */
  async getIssueComments(
    issueKey: string,
    options?: GetCommentsOptions,
  ): Promise<Comment[]> {
    this.logger.debug(`Getting comments for issue: ${issueKey}`, {
      prefix: "JIRA:IssueCommentRepository",
    });

    const queryParams: Record<string, string | number | undefined> = {};

    if (options?.maxComments) {
      queryParams.maxResults = options.maxComments;
    }

    if (options?.startAt) {
      queryParams.startAt = options.startAt;
    }

    if (options?.orderBy) {
      queryParams.orderBy = options.orderBy;
    }

    if (options?.expand && options.expand.length > 0) {
      queryParams.expand = options.expand.join(",");
    }

    const response = await this.httpClient.sendRequest<CommentsResult>({
      endpoint: `issue/${issueKey}/comment`,
      method: "GET",
      queryParams,
    });

    return response.comments;
  }
}
