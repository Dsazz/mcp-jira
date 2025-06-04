/**
 * Issue Search Repository Implementation
 */

import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type {
  SearchIssuesOptions,
  SearchIssuesResponse,
} from "../models/issue-search.models";

export interface IssueSearchRepository {
  searchIssues(options: SearchIssuesOptions): Promise<SearchIssuesResponse>;
}

export class IssueSearchRepositoryImpl implements IssueSearchRepository {
  constructor(private readonly client: HttpClient) {}

  async searchIssues(
    options: SearchIssuesOptions,
  ): Promise<SearchIssuesResponse> {
    const { jql, maxResults = 50, fields = [], startAt = 0 } = options;

    const response = await this.client.sendRequest<SearchIssuesResponse>({
      endpoint: "search",
      method: "POST",
      body: {
        jql,
        maxResults,
        fields,
        startAt,
      },
    });

    return response;
  }
}
