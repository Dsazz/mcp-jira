/**
 * Board List Formatter
 *
 * Formats JIRA board lists for professional display
 */

import type { StringFormatter } from "@features/jira/shared";
import type { Board } from "../models";
import { BoardEntryFormatter } from "./board-entry.formatter";

/**
 * Board formatter input interface
 */
export interface BoardFormatterInput {
  boards: Board[];
  appliedFilters?: {
    type?: string;
    projectKeyOrId?: string;
    name?: string;
    state?: string;
  };
  paginationInfo?: {
    hasMore?: boolean;
    maxResults?: number;
    startAt?: number;
  };
}

/**
 * BoardListFormatter implements the StringFormatter interface for formatting
 * JIRA board lists into user-friendly string representation
 */
export class BoardListFormatter
  implements StringFormatter<BoardFormatterInput>
{
  private readonly boardEntryFormatter: BoardEntryFormatter;

  constructor() {
    this.boardEntryFormatter = new BoardEntryFormatter();
  }

  /**
   * Format board data into a string representation
   *
   * @param data The board data to format
   * @returns Formatted string representation of board data
   */
  format(data: BoardFormatterInput): string {
    const { boards, appliedFilters, paginationInfo } = data;

    if (boards.length === 0) {
      return this.formatEmptyBoardList(appliedFilters);
    }

    const sections: string[] = [];

    // Header with summary
    sections.push(this.formatBoardListHeader(boards, appliedFilters));

    // Board list
    sections.push(this.formatBoardEntries(boards));

    // Pagination info if more results available
    if (paginationInfo?.hasMore) {
      sections.push(this.formatPaginationInfo(paginationInfo));
    }

    // Footer with next actions
    sections.push(this.formatBoardListFooter());

    return sections.join("\n\n");
  }

  /**
   * Format the header section with summary information
   */
  private formatBoardListHeader(
    boards: Board[],
    appliedFilters?: {
      type?: string;
      projectKeyOrId?: string;
      name?: string;
      state?: string;
    },
  ): string {
    const sections: string[] = [];

    // Title
    sections.push("# 📋 JIRA Boards");

    // Summary
    const summary = [
      `Found **${boards.length}** board${boards.length === 1 ? "" : "s"}`,
    ];

    if (appliedFilters) {
      const filterParts: string[] = [];
      if (appliedFilters.type) filterParts.push(`type: ${appliedFilters.type}`);
      if (appliedFilters.projectKeyOrId)
        filterParts.push(`project: ${appliedFilters.projectKeyOrId}`);
      if (appliedFilters.name)
        filterParts.push(`name: "${appliedFilters.name}"`);

      if (filterParts.length > 0) {
        summary.push(`(filtered by ${filterParts.join(", ")})`);
      }
    }

    sections.push(summary.join(" "));

    return sections.join("\n");
  }

  /**
   * Format individual board entries using the extracted formatter
   */
  private formatBoardEntries(boards: Board[]): string {
    const entries = boards.map((board, index) =>
      this.boardEntryFormatter.formatBoardEntry(board, index),
    );

    return entries.join("\n\n---\n\n");
  }

  /**
   * Format the footer section with next actions
   */
  private formatBoardListFooter(): string {
    const sections: string[] = [];

    sections.push("## 🚀 Next Actions");

    const suggestions = [
      "• Use `jira_get_sprints` to view sprints for a specific board",
      "• Use `jira_search_issues` to find issues on specific boards",
      "• Use `jira_get_projects` to explore project details",
      '• Filter boards by type: `type: "scrum"` or `type: "kanban"`',
      '• Search boards by name: `name: "My Board"`',
      '• Filter by project: `projectKeyOrId: "PROJ"`',
    ];

    sections.push(suggestions.join("\n"));

    return sections.join("\n");
  }

  /**
   * Format empty board list with helpful suggestions
   */
  private formatEmptyBoardList(appliedFilters?: {
    type?: string;
    projectKeyOrId?: string;
    name?: string;
    state?: string;
  }): string {
    const sections: string[] = [];

    sections.push("# 📋 JIRA Boards");
    sections.push("No boards found matching your criteria.");

    if (appliedFilters) {
      const filterParts: string[] = [];
      if (appliedFilters.type) filterParts.push(`type: ${appliedFilters.type}`);
      if (appliedFilters.projectKeyOrId)
        filterParts.push(`project: ${appliedFilters.projectKeyOrId}`);
      if (appliedFilters.name)
        filterParts.push(`name: "${appliedFilters.name}"`);

      if (filterParts.length > 0) {
        sections.push(`**Applied filters:** ${filterParts.join(", ")}`);
      }
    }

    sections.push("## 💡 Suggestions");

    const suggestions = [
      "• Try removing some filters to see more results",
      "• Check if you have access to boards in the specified project",
      "• Use `jira_get_projects` to see available projects first",
      "• Contact your JIRA administrator if you expect to see boards",
      "• Try searching with a different board name or type",
    ];

    sections.push(suggestions.join("\n"));

    return sections.join("\n\n");
  }

  /**
   * Format pagination information
   */
  private formatPaginationInfo(paginationInfo: {
    hasMore?: boolean;
    maxResults?: number;
    startAt?: number;
  }): string {
    const sections: string[] = [];

    if (paginationInfo.hasMore) {
      sections.push("📄 **Pagination Info**");
      sections.push(
        "There are more boards available. Use pagination parameters to see additional results:",
      );

      const nextStartAt =
        (paginationInfo.startAt || 0) + (paginationInfo.maxResults || 50);
      sections.push(`• Next page: \`startAt: ${nextStartAt}\``);
      sections.push(
        `• Current page size: \`maxResults: ${paginationInfo.maxResults || 50}\``,
      );
    }

    return sections.join("\n");
  }
}
