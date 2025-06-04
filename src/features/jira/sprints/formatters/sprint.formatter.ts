/**
 * Sprint Formatter
 *
 * Formats JIRA sprint details for professional display
 */

import { type Sprint, SprintState } from "../models";
import type { Formatter } from "@features/jira/shared/formatters/formatter.interface";

/**
 * SprintFormatter implements the Formatter interface for formatting
 * a JIRA sprint into a user-friendly string representation
 */
export class SprintFormatter implements Formatter<Sprint, string> {
  /**
   * Format sprint data into a string representation
   *
   * @param sprint The sprint to format
   * @returns Formatted string representation of the sprint
   */
  format(sprint: Sprint): string {
    const sections: string[] = [];

    // Header with sprint name and ID
    sections.push(this.formatHeader(sprint));

    // Main details
    sections.push(this.formatDetails(sprint));

    // Timeline and dates
    const timeline = this.formatTimeline(sprint);
    if (timeline) {
      sections.push(timeline);
    }

    // Analytics section (if applicable)
    const analytics = this.formatAnalytics(sprint);
    if (analytics) {
      sections.push(analytics);
    }

    // Quick actions footer
    sections.push(this.formatActions(sprint));

    return sections.join("\n\n");
  }

  /**
   * Format the header section with sprint name and ID
   */
  private formatHeader(sprint: Sprint): string {
    const stateIcon = this.getStateIcon(sprint.state);
    return `# 🏃 Sprint: ${sprint.name}\n**ID:** ${sprint.id} | **State:** ${stateIcon} ${sprint.state.toUpperCase()}`;
  }

  /**
   * Format the main details section
   */
  private formatDetails(sprint: Sprint): string {
    const details: string[] = [];

    // Goal (if available)
    if (sprint.goal) {
      details.push(`## 🎯 Goal\n${sprint.goal}`);
    }

    // Board info (if available)
    if (sprint.originBoardId) {
      details.push(`**Origin Board:** ${sprint.originBoardId}`);
    }

    return (
      details.join("\n\n") || "No additional details available for this sprint."
    );
  }

  /**
   * Format timeline and dates section
   */
  private formatTimeline(sprint: Sprint): string | null {
    const dates: string[] = [];

    // Collection of dates
    if (sprint.startDate) {
      const startDate = new Date(sprint.startDate);
      dates.push(`**Start Date:** ${this.formatDate(startDate)}`);
    }

    if (sprint.endDate) {
      const endDate = new Date(sprint.endDate);
      dates.push(`**End Date:** ${this.formatDate(endDate)}`);
    }

    if (sprint.completeDate) {
      const completeDate = new Date(sprint.completeDate);
      dates.push(`**Completed:** ${this.formatDate(completeDate)}`);
    }

    if (sprint.createdDate) {
      const createdDate = new Date(sprint.createdDate);
      dates.push(`**Created:** ${this.formatDate(createdDate)}`);
    }

    if (dates.length === 0) {
      return null;
    }

    // Calculate progress for active sprints
    let progressInfo = "";
    if (
      sprint.state === SprintState.ACTIVE &&
      sprint.startDate &&
      sprint.endDate
    ) {
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

      progressInfo = `\n\n**Progress:** ${progress.toFixed(1)}% (${daysRemaining} of ${daysTotal} days remaining)`;
    }

    return `## ⏱️ Timeline\n${dates.join(" | ")}${progressInfo}`;
  }

  /**
   * Format analytics section (placeholder for future enhancement)
   */
  private formatAnalytics(sprint: Sprint): string | null {
    // This would be enhanced with actual sprint metrics in a real implementation
    // For now, return basic state-based information
    const analytics: string[] = ["## 📊 Sprint Status"];

    if (sprint.state === SprintState.ACTIVE) {
      analytics.push("🔄 **Status:** Sprint is currently in progress");
      analytics.push(
        "ℹ️ Use the Sprint Report link below to view real-time metrics",
      );
    } else if (sprint.state === SprintState.CLOSED) {
      analytics.push("✅ **Status:** Sprint has been completed");
      analytics.push(
        "ℹ️ View the Sprint Report for complete metrics and outcomes",
      );
    } else if (sprint.state === SprintState.FUTURE) {
      analytics.push("⏳ **Status:** Sprint is planned for the future");
      analytics.push("ℹ️ Sprint details may be updated before it begins");
    }

    return analytics.join("\n");
  }

  /**
   * Format quick actions section
   */
  private formatActions(sprint: Sprint): string {
    const actions: string[] = ["## 🚀 Quick Actions"];

    if (sprint.self) {
      actions.push(`• [View Sprint in JIRA](${sprint.self})`);
      actions.push(`• [Sprint Report](${sprint.self}/report)`);

      if (sprint.originBoardId) {
        actions.push(
          `• [View Board](${sprint.self.replace(/\/sprint\/\d+/, "")})`,
        );
        actions.push(
          `• Get other sprints: \`jira_get_sprints boardId=${sprint.originBoardId}\``,
        );
      }
    }

    // Add search actions
    actions.push(
      `• Search issues in this sprint: \`jira_search_issues jql="sprint=${sprint.id}"\``,
    );

    if (sprint.state === SprintState.ACTIVE) {
      actions.push(
        `• Get active sprint issues: \`jira_search_issues jql="sprint=${sprint.id} AND status != Done"\``,
      );
    }

    return actions.join("\n");
  }

  /**
   * Get state icon for sprint state
   */
  private getStateIcon(state: SprintState): string {
    switch (state) {
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
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
