/**
 * Get Current User Handler
 *
 * MCP tool handler for retrieving current user profile information
 */
import { BaseToolHandler } from "@core/tools/tool-handler.class";
import {
  JiraApiError,
  JiraPermissionError,
} from "@features/jira/client/errors";
import { UserProfileFormatter } from "@features/jira/users/formatters";
import type { GetCurrentUserUseCase } from "@features/jira/users/use-cases";

/**
 * Handler for retrieving current user profile information
 */
export class GetCurrentUserHandler extends BaseToolHandler<
  Record<string, never>,
  string
> {
  private formatter: UserProfileFormatter;

  /**
   * Create a new GetCurrentUserHandler with use case
   *
   * @param getCurrentUserUseCase - Use case for retrieving current user profile
   */
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {
    super("JIRA", "Get Current User");
    this.formatter = new UserProfileFormatter();
  }

  /**
   * Execute the handler logic
   * Retrieves current user profile and formats it
   */
  protected async execute(): Promise<string> {
    try {
      this.logger.info("Getting current user profile");

      // Get current user using use case
      const response = await this.getCurrentUserUseCase.execute();

      // Format user profile using the formatter
      return this.formatter.format(response.user);
    } catch (error) {
      this.logger.error(`Failed to get current user: ${error}`);
      throw this.enhanceError(error);
    }
  }

  /**
   * Enhance error messages for better user guidance
   */
  private enhanceError(error: unknown): Error {
    if (error instanceof JiraPermissionError) {
      return new Error(
        "❌ **Permission Denied**\n\nYou don't have permission to access user profile information.\n\n**Solutions:**\n- Check your JIRA authentication\n- Verify your API token is valid\n- Contact your JIRA administrator\n\n**Required Permissions:** Valid JIRA authentication",
      );
    }

    if (error instanceof JiraApiError) {
      return new Error(
        `❌ **JIRA API Error**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your authentication credentials\n- Try again in a few moments\n\n**Example:** \`jira_get_current_user\``,
      );
    }

    if (error instanceof Error) {
      return new Error(
        `❌ **User Profile Retrieval Failed**\n\n${error.message}\n\n**Solutions:**\n- Check your JIRA connection\n- Verify your authentication\n- Try again in a few moments\n\n**Example:** \`jira_get_current_user\``,
      );
    }

    return new Error(
      "❌ **Unknown Error**\n\nAn unknown error occurred during user profile retrieval.\n\nPlease check your connection and try again.",
    );
  }
}
