/**
 * Sprint List Formatter
 *
 * Formats JIRA sprint lists for professional display with analytics
 */

import type { Sprint } from "../api/jira.client.types";

/**
 * Format a list of sprints for display
 */
export function formatSprintList(
  sprints: Sprint[],
  boardId?: number,
  appliedFilters?: {
    state?: string;
    boardId?: number;
  },
): string {
  if (sprints.length === 0) {
    return formatEmptySprintList(boardId, appliedFilters);
  }

  const sections: string[] = [];

  // Header with summary
  sections.push(formatSprintListHeader(sprints, boardId, appliedFilters));

  // Sprint list grouped by state
  sections.push(formatSprintEntries(sprints));

  // Footer with next actions
  sections.push(formatSprintListFooter(boardId));

  return sections.join("\n\n");
}

/**
 * Format the header section with summary information
 */
function formatSprintListHeader(
  sprints: Sprint[],
  boardId?: number,
  appliedFilters?: {
    state?: string;
    boardId?: number;
  },
): string {
  const sections: string[] = [];

  // Title
  const title = boardId
    ? `# 🏃 Sprints for Board ${boardId}`
    : "# 🏃 JIRA Sprints";
  sections.push(title);

  // Summary with state breakdown
  const stateBreakdown = getStateBreakdown(sprints);
  const summary = [
    `Found **${sprints.length}** sprint${sprints.length === 1 ? "" : "s"}`,
  ];

  if (stateBreakdown.length > 0) {
    summary.push(`(${stateBreakdown.join(", ")})`);
  }

  if (appliedFilters?.state) {
    summary.push(`filtered by state: **${appliedFilters.state}**`);
  }

  sections.push(summary.join(" "));

  return sections.join("\n");
}

/**
 * Get state breakdown summary
 */
function getStateBreakdown(sprints: Sprint[]): string[] {
  const states = sprints.reduce(
    (acc, sprint) => {
      acc[sprint.state] = (acc[sprint.state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(states).map(([state, count]) => {
    const stateIcon = getStateIcon(state);
    return `${stateIcon} ${count} ${state}`;
  });
}

/**
 * Format individual sprint entries grouped by state
 */
function formatSprintEntries(sprints: Sprint[]): string {
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
  const stateOrder = ["active", "future", "closed"];
  const orderedStates = stateOrder.filter((state) => groupedSprints[state]);

  const stateGroups = orderedStates.map((state) => {
    const stateIcon = getStateIcon(state);
    const stateSprints = groupedSprints[state];

    const stateHeader = `## ${stateIcon} ${state.toUpperCase()} SPRINTS (${stateSprints.length})`;

    const sprintEntries = stateSprints.map((sprint, index) => {
      const sections: string[] = [];

      // Sprint header
      sections.push(`### ${index + 1}. ${sprint.name}`);
      sections.push(
        `**Sprint ID:** ${sprint.id} | **State:** ${getStateIcon(sprint.state)} ${sprint.state.toUpperCase()}`,
      );

      // Dates and timeline
      const dateInfo = formatSprintDates(sprint);
      if (dateInfo) {
        sections.push(dateInfo);
      }

      // Goal
      if (sprint.goal) {
        sections.push(`**Goal:** ${sprint.goal}`);
      }

      // Board information
      if (sprint.originBoardId) {
        sections.push(`**Origin Board:** ${sprint.originBoardId}`);
      }

      // Sprint analytics (if available)
      const analytics = formatSprintAnalytics(sprint);
      if (analytics) {
        sections.push(analytics);
      }

      // Quick actions
      const actions: string[] = [];
      actions.push(`[View Sprint](${sprint.self})`);
      actions.push(`[Sprint Report](${sprint.self}/report)`);
      if (sprint.originBoardId) {
        actions.push(
          `[View Board](${sprint.self.replace(/\/sprint\/\d+/, "")})`,
        );
      }

      sections.push(`**Quick Actions:** ${actions.join(" | ")}`);

      return sections.join("\n");
    });

    return [stateHeader, ...sprintEntries].join("\n\n");
  });

  return stateGroups.join("\n\n---\n\n");
}

/**
 * Format sprint dates and timeline information
 */
function formatSprintDates(sprint: Sprint): string | null {
  const dateInfo: string[] = [];

  if (sprint.startDate) {
    const startDate = new Date(sprint.startDate);
    dateInfo.push(`**Start:** ${formatDate(startDate)}`);
  }

  if (sprint.endDate) {
    const endDate = new Date(sprint.endDate);
    dateInfo.push(`**End:** ${formatDate(endDate)}`);
  }

  if (sprint.completeDate) {
    const completeDate = new Date(sprint.completeDate);
    dateInfo.push(`**Completed:** ${formatDate(completeDate)}`);
  }

  if (sprint.createdDate) {
    const createdDate = new Date(sprint.createdDate);
    dateInfo.push(`**Created:** ${formatDate(createdDate)}`);
  }

  // Calculate duration and progress for active sprints
  if (sprint.state === "active" && sprint.startDate && sprint.endDate) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const now = new Date();

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = Math.min(
      100,
      Math.max(0, (elapsed / totalDuration) * 100),
    );

    const daysTotal = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    dateInfo.push(
      `**Progress:** ${progress.toFixed(1)}% (${daysRemaining}/${daysTotal} days remaining)`,
    );
  }

  return dateInfo.length > 0 ? dateInfo.join(" | ") : null;
}

/**
 * Format sprint analytics (placeholder for future enhancement)
 */
function formatSprintAnalytics(sprint: Sprint): string | null {
  // This could be enhanced with actual sprint metrics if available
  // For now, just return basic state-based information

  if (sprint.state === "closed" && sprint.completeDate) {
    return "**Status:** ✅ Sprint completed successfully";
  }

  if (sprint.state === "active") {
    return "**Status:** 🔄 Sprint in progress";
  }

  if (sprint.state === "future") {
    return "**Status:** ⏳ Sprint planned for future";
  }

  return null;
}

/**
 * Get state icon for sprint state
 */
function getStateIcon(state: string): string {
  switch (state.toLowerCase()) {
    case "active":
      return "🔄";
    case "future":
      return "⏳";
    case "closed":
      return "✅";
    default:
      return "📋";
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format the footer section with next actions
 */
function formatSprintListFooter(boardId?: number): string {
  const sections: string[] = [];

  sections.push("## 🚀 Next Actions");

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
function formatEmptySprintList(
  boardId?: number,
  appliedFilters?: {
    state?: string;
    boardId?: number;
  },
): string {
  const sections: string[] = [];

  const title = boardId
    ? `# 🏃 Sprints for Board ${boardId}`
    : "# 🏃 JIRA Sprints";
  sections.push(title);
  sections.push("No sprints found matching your criteria.");

  if (appliedFilters?.state) {
    sections.push(`**Applied filters:** state: ${appliedFilters.state}`);
  }

  sections.push("## 💡 Suggestions");

  const suggestions = [
    "• Try removing the state filter to see all sprints",
    "• Check if the board has any sprints created",
    "• Use `jira_get_boards` to find boards with sprints",
    "• Contact your JIRA administrator if you expect to see sprints",
    "• Try a different board ID if searching for specific board sprints",
  ];

  if (boardId) {
    suggestions.splice(
      2,
      0,
      `• Verify that board ${boardId} exists and you have access to it`,
    );
  }

  sections.push(suggestions.join("\n"));

  return sections.join("\n\n");
}
