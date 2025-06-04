/**
 * Issue Search Repository Implementation
 */

import type { JiraHttpClient } from "../../client/http/jira-http-client";
import type { SearchIssuesOptions, SearchIssuesResponse } from "../models/issue-search.models";

export interface IssueSearchRepository {
  searchIssues(options: SearchIssuesOptions): Promise<SearchIssuesResponse>;
}

export class IssueSearchRepositoryImpl implements IssueSearchRepository {
  constructor(private readonly client: JiraHttpClient) {}

  async searchIssues(options: SearchIssuesOptions): Promise<SearchIssuesResponse> {
    const { jql, maxResults = 50, fields = [], startAt = 0 } = options;
    
    const response = await this.client.post("/rest/api/3/search", {
      jql,
      maxResults,
      fields,
      startAt,
    });
    
    return response.data;
  }
}
