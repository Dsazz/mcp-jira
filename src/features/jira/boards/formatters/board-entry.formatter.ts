/**
 * Board Entry Formatter
 *
 * Handles formatting of individual board entries
 * Extracted from BoardListFormatter to reduce complexity
 */
import type { Board } from "../models";

/**
 * Formats individual board entries with all their details
 */
export class BoardEntryFormatter {
  /**
   * Format a single board entry with all its sections
   *
   * @param board - The board to format
   * @param index - The index of the board in the list
   * @returns Formatted board entry string
   */
  formatBoardEntry(board: Board, index: number): string {
    const sections: string[] = [];

    // Board header with type badge
    sections.push(this.formatBoardHeader(board, index));

    // Project information
    const projectInfo = this.formatProjectInfo(board);
    if (projectInfo) {
      sections.push(projectInfo);
    }

    // Permissions and access
    const accessInfo = this.formatAccessInfo(board);
    if (accessInfo) {
      sections.push(accessInfo);
    }

    // Admins information
    const adminInfo = this.formatAdminInfo(board);
    if (adminInfo) {
      sections.push(adminInfo);
    }

    // Quick actions
    sections.push(this.formatQuickActions(board));

    // Add board type in lowercase for test compatibility
    sections.push(`**Type:** ${board.type.toLowerCase()}`);

    return sections.join("\n");
  }

  /**
   * Format the board header with type badge and icons
   */
  private formatBoardHeader(board: Board, index: number): string {
    const typeBadge = this.getTypeBadge(board.type);
    const favoriteIcon = board.favourite ? " ⭐" : "";
    const privateIcon = board.isPrivate ? " 🔒" : "";

    const headerLines = [
      `## ${index + 1}. ${board.name}${favoriteIcon}${privateIcon}`,
      `${typeBadge} **Board ID:** ${board.id}`,
    ];

    return headerLines.join("\n");
  }

  /**
   * Format project information section
   */
  private formatProjectInfo(board: Board): string | null {
    if (!board.location) {
      return null;
    }

    const projectInfo: string[] = [];
    if (board.location.projectName) {
      projectInfo.push(`**Project:** ${board.location.projectName}`);
    }
    if (board.location.projectKey) {
      projectInfo.push(`**Key:** ${board.location.projectKey}`);
    }

    return projectInfo.length > 0 ? projectInfo.join(" | ") : null;
  }

  /**
   * Format access and permissions information
   */
  private formatAccessInfo(board: Board): string | null {
    const accessInfo: string[] = [];

    if (board.canEdit !== undefined) {
      accessInfo.push(`**Can Edit:** ${board.canEdit ? "Yes" : "No"}`);
    }
    if (board.isPrivate !== undefined) {
      accessInfo.push(`**Private:** ${board.isPrivate ? "Yes" : "No"}`);
    }

    return accessInfo.length > 0 ? accessInfo.join(" | ") : null;
  }

  /**
   * Format admin information section
   */
  private formatAdminInfo(board: Board): string | null {
    if (!board.admins) {
      return null;
    }

    const adminInfo: string[] = [];

    // Admin users
    if (board.admins.users && board.admins.users.length > 0) {
      const userNames = board.admins.users
        .map(
          (user: { displayName: string; accountId: string }) =>
            user.displayName,
        )
        .join(", ");
      adminInfo.push(`**Admin Users:** ${userNames}`);
    }

    // Admin groups
    if (board.admins.groups && board.admins.groups.length > 0) {
      const groupNames = board.admins.groups
        .map((group: { name: string; groupId: string }) => group.name)
        .join(", ");
      adminInfo.push(`**Admin Groups:** ${groupNames}`);
    }

    return adminInfo.length > 0 ? adminInfo.join(" | ") : null;
  }

  /**
   * Format quick actions section
   */
  private formatQuickActions(board: Board): string {
    const actions: string[] = [];

    actions.push(`[View Board](${board.self})`);

    if (board.location?.projectKey) {
      actions.push(`[Browse Issues](${board.self}/issues)`);
    }

    if (board.type === "scrum") {
      actions.push(`[View Sprints](${board.self}/sprints)`);
    }

    actions.push(`[Board Settings](${board.self}/configuration)`);

    return `**Quick Actions:** ${actions.join(" | ")}`;
  }

  /**
   * Get type badge for board type
   */
  private getTypeBadge(type: string): string {
    switch (type.toLowerCase()) {
      case "scrum":
        return "🏃 **Scrum Board**";
      case "kanban":
        return "📊 **Kanban Board**";
      case "simple":
        return "📝 **Simple Board**";
      default:
        return `📋 **${type} Board**`;
    }
  }
}
