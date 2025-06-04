/**
 * Sprint Entry Builder
 *
 * Handles building comprehensive sprint entry sections
 * Extracted from SprintListFormatter to reduce complexity
 */
import type { Sprint } from "../models";

/**
 * Builder for formatting individual sprint entries
 */
export class SprintEntryBuilder {
  constructor(private readonly sprint: Sprint) {}

  /**
   * Build complete sprint entry with all sections
   */
  buildEntry(index: number): string {
    const sections: string[] = [];

    // Sprint header
    sections.push(`### ${index + 1}. ${this.sprint.name}`);
    sections.push(this.buildStateInfo());

    // Dates and timeline
    const dateInfo = this.buildDateInfo();
    if (dateInfo) {
      sections.push(dateInfo);
    }

    // Goal
    this.addGoal(sections);

    // Board information
    this.addBoardInfo(sections);

    // Sprint analytics
    const analytics = this.buildAnalytics();
    if (analytics) {
      sections.push(analytics);
    }

    // Quick actions
    sections.push(this.buildQuickActions());

    return sections.join("\n");
  }

  /**
   * Build sprint state information
   */
  private buildStateInfo(): string {
    return `**Sprint ID:** ${this.sprint.id} | **State:** ${this.getStateIcon()} ${this.sprint.state.toUpperCase()}`;
  }

  /**
   * Build date information and timeline
   */
  private buildDateInfo(): string | null {
    const dateInfo: string[] = [];

    this.addStartDate(dateInfo);
    this.addEndDate(dateInfo);
    this.addCompleteDate(dateInfo);
    this.addCreatedDate(dateInfo);
    this.addProgressInfo(dateInfo);

    return dateInfo.length > 0 ? dateInfo.join(" | ") : null;
  }

  /**
   * Add goal section if available
   */
  private addGoal(sections: string[]): void {
    if (this.sprint.goal) {
      sections.push(`**Goal:** ${this.sprint.goal}`);
    }
  }

  /**
   * Add board information if available
   */
  private addBoardInfo(sections: string[]): void {
    if (!this.sprint.originBoardId) {
      return;
    }

    sections.push(`**Origin Board:** ${this.sprint.originBoardId}`);
  }

  /**
   * Build sprint analytics
   */
  private buildAnalytics(): string | null {
    if (this.sprint.state === "closed" && this.sprint.completeDate) {
      return "**Status:** ✅ Sprint completed successfully";
    }

    if (this.sprint.state === "active") {
      return "**Status:** 🔄 Sprint in progress";
    }

    if (this.sprint.state === "future") {
      return "**Status:** ⏳ Sprint planned for future";
    }

    return null;
  }

  /**
   * Build quick actions section
   */
  private buildQuickActions(): string {
    const actions: string[] = [];

    if (this.sprint.self !== undefined) {
      const sprintUrl = this.sprint.self || "";
      actions.push(`[View Sprint](${sprintUrl})`);
      actions.push(`[Sprint Report](${sprintUrl}/report)`);

      if (!!this.sprint.originBoardId && this.sprint.self) {
        actions.push(
          `[View Board](${this.sprint.self.replace(/\/sprint\/\d+/, "")})`,
        );
      }
    }

    return `**Quick Actions:** ${actions.join(" | ")}`;
  }

  /**
   * Add start date information
   */
  private addStartDate(dateInfo: string[]): void {
    if (this.sprint.startDate) {
      const startDate = new Date(this.sprint.startDate);
      dateInfo.push(`**Start:** ${this.formatDate(startDate)}`);
    }
  }

  /**
   * Add end date information
   */
  private addEndDate(dateInfo: string[]): void {
    if (this.sprint.endDate) {
      const endDate = new Date(this.sprint.endDate);
      dateInfo.push(`**End:** ${this.formatDate(endDate)}`);
    }
  }

  /**
   * Add complete date information
   */
  private addCompleteDate(dateInfo: string[]): void {
    if (this.sprint.completeDate) {
      const completeDate = new Date(this.sprint.completeDate);
      dateInfo.push(`**Completed:** ${this.formatDate(completeDate)}`);
    }
  }

  /**
   * Add created date information
   */
  private addCreatedDate(dateInfo: string[]): void {
    if (this.sprint.createdDate) {
      const createdDate = new Date(this.sprint.createdDate);
      dateInfo.push(`**Created:** ${this.formatDate(createdDate)}`);
    }
  }

  /**
   * Add progress information for active sprints
   */
  private addProgressInfo(dateInfo: string[]): void {
    if (
      this.sprint.state === "active" &&
      this.sprint.startDate &&
      this.sprint.endDate
    ) {
      const start = new Date(this.sprint.startDate);
      const end = new Date(this.sprint.endDate);
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
  }

  /**
   * Get state icon for sprint state
   */
  private getStateIcon(): string {
    switch (this.sprint.state.toLowerCase()) {
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
  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
