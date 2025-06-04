import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { User } from "../models";

/**
 * Repository interface for user profile operations
 * Clear responsibility: managing user information and authentication context
 */
export interface UserProfileRepository {
  getCurrentUser(): Promise<User>;
}

/**
 * Implementation of UserProfileRepository
 * Extracted from JiraClient god object - user profile operations only
 */
export class UserProfileRepositoryImpl implements UserProfileRepository {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    this.logger.debug("Getting current user", {
      prefix: "JIRA:UserProfileRepository",
    });

    return this.httpClient.sendRequest<User>({
      endpoint: "myself",
      method: "GET",
    });
  }
}
