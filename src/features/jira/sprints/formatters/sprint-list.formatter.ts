/**
 * Sprint List Formatter
 *
 * Formats JIRA sprint lists with comprehensive sprint information,
 * state grouping, and professional presentation
 */

import type { Formatter } from "@features/jira/shared/formatters/formatter.interface";
import type { Sprint } from "../models";
import { SprintState } from "../models";
import { SprintEntryBuilder } from "./sprint-entry.builder";

/**
 * Input data for sprint list formatting
 */
export interface SprintListFormatterInput {
  sprints: Sprint[];
  boardId?: number;
  appliedFilters?: {
    state?: SprintState | string;
    boardId?: number;
  };
}

/**
 * Formatter for JIRA sprint lists
 * Provides professional formatting with sprint details, state grouping, and navigation
 */
export class SprintListFormatter
  implements Formatter<SprintListFormatterInput, string>
{
  /**
   * Format a list of sprints with context information
   *
   * @param data - Sprint list data with context
   * @returns Formatted sprint list string
   */
  format(data: SprintListFormatterInput): string {
    const { sprints, boardId, appliedFilters } = data;

    if (sprints.length === 0) {
      return this.formatEmptySprintList(boardId, appliedFilters);
    }

    const sections = [
      this.formatSprintListHeader(sprints, boardId, appliedFilters),
      this.formatSprintEntries(sprints),
      this.formatSprintListFooter(boardId),
    ];

    return sections.filter(Boolean).join("\n\n");
  }

  /**
   * Format the header with summary information
   */
  private formatSprintListHeader(
    sprints: Sprint[],
    boardId?: number,
    appliedFilters?: {
      state?: SprintState | string;
      boardId?: number;
    },
  ): string {
    const count = sprints.length;
    let header = "";

    // Title format based on context
    if (boardId) {
      header = `🏃 Sprints for Board ${boardId}`;
    } else {
      header = "🏃 JIRA Sprints";
    }

    // Add filter context to title if present
    if (appliedFilters?.state) {
      header += ` - ${appliedFilters.state.toUpperCase()} Sprints`;
    }

    header += `\n\nFound **${count}** sprint${count !== 1 ? "s" : ""}`;

    // Add state breakdown in compact format
    const stateBreakdown = this.getCompactStateBreakdown(sprints);
    if (stateBreakdown) {
      header += `\n\n${stateBreakdown}`;
    }

    // Add filter information if present
    if (appliedFilters?.state) {
      header += `\n\nfiltered by state: **${appliedFilters.state}**`;
    }

    return header;
  }

  /**
   * Get compact breakdown of sprints by state (e.g., "🔄 1 active, ✅ 1 closed")
   */
  private getCompactStateBreakdown(sprints: Sprint[]): string {
    const stateCounts = sprints.reduce(
      (acc, sprint) => {
        acc[sprint.state] = (acc[sprint.state] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const parts: string[] = [];

    // Order: active, closed, future
    const orderedStates = ["active", "closed", "future"];

    for (const state of orderedStates) {
      const count = stateCounts[state];
      if (count > 0) {
        const icon = this.getStateIcon(state);
        parts.push(`${icon} ${count} ${state}`);
      }
    }

    return parts.length > 0 ? parts.join(", ") : "";
  }

  /**
   * Format sprint entries grouped by state using SprintEntryBuilder
   */
  private formatSprintEntries(sprints: Sprint[]): string {
    // Group sprints by state
    const groupedSprints = sprints.reduce(
      (acc, sprint) => {
        if (!acc[sprint.state]) {
          acc[sprint.state] = [];
        }
        acc[sprint.state].push(sprint);
        return acc;
      },
      {} as Record<string, Sprint[]>,
    );

    // Order states: active, future, closed
    const orderedStates = ["active", "future", "closed"].filter(
      (state) => groupedSprints[state]?.length > 0,
    );

    const stateGroups = orderedStates.map((state) => {
      const stateIcon = this.getStateIcon(state);
      const stateSprints = groupedSprints[state];

      const stateHeader = `## ${stateIcon} ${state.toUpperCase()} SPRINTS (${stateSprints.length})`;

      const sprintEntries = stateSprints.map((sprint, index) => {
        const builder = new SprintEntryBuilder(sprint);
        return builder.buildEntry(index);
      });

      return [stateHeader, ...sprintEntries].join("\n\n");
    });

    return stateGroups.join("\n\n---\n\n");
  }

  /**
   * Get state icon for sprint state
   */
  private getStateIcon(state: string): string {
    switch (state.toLowerCase()) {
      case SprintState.ACTIVE:
        return "🔄";
      case SprintState.FUTURE:
        return "⏳";
      case SprintState.CLOSED:
        return "✅";
      default:
        return "📋";
    }
  }

  /**
   * Format the footer section with next actions
   */
  private formatSprintListFooter(boardId?: number): string {
    const sections: string[] = [];

    sections.push("🚀 Next Actions");

    const suggestions = [
      "• Use `jira_search_issues` to find issues in specific sprints",
      "• Use `jira_get_boards` to explore other boards",
      '• Filter sprints by state: `state: "active"`, `state: "future"`, or `state: "closed"`',
      "• View sprint reports for detailed analytics and metrics",
    ];

    if (boardId) {
      suggestions.splice(
        1,
        0,
        `• Use \`jira_get_boards\` to view board ${boardId} details`,
      );
    }

    sections.push(suggestions.join("\n"));

    return sections.join("\n");
  }

  /**
   * Format empty sprint list with helpful suggestions
   */
  private formatEmptySprintList(
    boardId?: number,
    appliedFilters?: {
      state?: SprintState | string;
      boardId?: number;
    },
  ): string {
    const sections: string[] = [];

    const title = boardId
      ? `🏃 Sprints for Board ${boardId}`
      : "🏃 JIRA Sprints";

    sections.push(title);
    sections.push("No sprints found matching your criteria");

    // Add applied filters information
    if (appliedFilters?.state) {
      sections.push(`**Applied filters:** state: ${appliedFilters.state}`);
    }

    // Add suggestions
    sections.push("💡 Suggestions");
    const suggestions = [
      "• Try removing the state filter to see all sprints",
      "• Check if the board has any sprints created",
      "• Contact your JIRA administrator if you need access",
    ];
    sections.push(suggestions.join("\n"));

    return sections.join("\n\n");
  }
}
