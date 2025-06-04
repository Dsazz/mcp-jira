/**
 * User Profile use cases
 *
 * Business logic for managing user profile information
 */

import type { User } from "@features/jira/users/models";
import type { UserProfileRepository } from "@features/jira/users/repositories";

/**
 * Response for getting current user profile
 */
export interface GetCurrentUserResponse {
  /**
   * The current user information
   */
  user: User;
}

/**
 * Use case for getting current user profile
 */
export interface GetCurrentUserUseCase {
  /**
   * Get the current user's profile information
   *
   * @returns Promise resolving to get current user response
   */
  execute(): Promise<GetCurrentUserResponse>;
}

/**
 * Implementation of GetCurrentUserUseCase
 */
export class GetCurrentUserUseCaseImpl implements GetCurrentUserUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(): Promise<GetCurrentUserResponse> {
    const user = await this.userProfileRepository.getCurrentUser();

    return { user };
  }
}
