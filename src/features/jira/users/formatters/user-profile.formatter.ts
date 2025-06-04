/**
 * User profile formatter
 */
import type { User } from "../models";
import type { Formatter } from "@features/jira/shared/formatters/formatter.interface";

/**
 * Formatter class for user profile data
 */
export class UserProfileFormatter implements Formatter<User, string> {
  /**
   * Format a user profile for display
   */
  format(user: User): string {
    if (!user) {
      return "";
    }

    // Basic user details
    let formattedUser = `# User: ${user.displayName}\n\n`;

    // User metadata
    formattedUser += `**Account ID:** ${user.accountId}\n`;
    formattedUser += `**Status:** ${user.active ? "Active" : "Inactive"}\n`;
    formattedUser += `**Account Type:** ${user.accountType || "Unknown"}\n`;
    
    // Optional fields
    if (user.emailAddress) {
      formattedUser += `**Email:** ${user.emailAddress}\n`;
    }
    
    if (user.timeZone) {
      formattedUser += `**Time Zone:** ${user.timeZone}\n`;
    }

    // Avatar
    if (user.avatarUrls && Object.keys(user.avatarUrls).length > 0) {
      const avatarUrl = Object.values(user.avatarUrls)[0];
      formattedUser += `\n![User Avatar](${avatarUrl})\n`;
    }

    // URL
    if (user.self) {
      formattedUser += `\n**URL:** [View Profile](${user.self})\n`;
    }

    return formattedUser;
  }
} 