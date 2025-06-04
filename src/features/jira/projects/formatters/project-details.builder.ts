/**
 * Project Details Builder
 *
 * Handles building comprehensive project details sections
 * Extracted from ProjectListFormatter to reduce complexity
 */
import type { Project } from "../models";

/**
 * Builder for formatting project details sections
 */
export class ProjectDetailsBuilder {
  private badges: string[] = [];
  private details: string[] = [];

  constructor(private readonly project: Project) {}

  /**
   * Build project badges (type, privacy, simplified)
   */
  buildBadges(): string[] {
    this.badges = [];

    if (this.project.projectTypeKey) {
      this.badges.push(`\`${this.project.projectTypeKey}\``);
    }

    if (this.project.isPrivate) {
      this.badges.push("`🔒 Private`");
    }

    if (this.project.simplified) {
      this.badges.push("`⚡ Simplified`");
    }

    return this.badges;
  }

  /**
   * Build project details (lead, category, components, versions, issue types)
   */
  buildDetails(): string[] {
    this.details = [];

    this.addLeadDetail();
    this.addCategoryDetail();
    this.addComponentsDetail();
    this.addVersionsDetail();
    this.addIssueTypesDetail();

    return this.details;
  }

  /**
   * Build quick actions for the project
   */
  buildQuickActions(): string[] {
    return [
      `[View Project](${this.getProjectUrl()})`,
      `[Browse Issues](${this.getProjectIssuesUrl()})`,
      `[Project Settings](${this.getProjectSettingsUrl()})`,
    ];
  }

  /**
   * Get project description if available
   */
  getDescription(): string | null {
    return this.project.description || null;
  }

  /**
   * Add project lead detail
   */
  private addLeadDetail(): void {
    if (this.project.lead) {
      this.details.push(`**Lead:** ${this.project.lead.displayName}`);
    }
  }

  /**
   * Add project category detail
   */
  private addCategoryDetail(): void {
    if (this.project.projectCategory) {
      this.details.push(`**Category:** ${this.project.projectCategory.name}`);
    }
  }

  /**
   * Add components detail
   */
  private addComponentsDetail(): void {
    if (this.project.components && this.project.components.length > 0) {
      const componentCount = this.project.components.length;
      this.details.push(
        `**Components:** ${componentCount} component${componentCount !== 1 ? "s" : ""}`,
      );
    }
  }

  /**
   * Add versions detail
   */
  private addVersionsDetail(): void {
    if (this.project.versions && this.project.versions.length > 0) {
      const versionCount = this.project.versions.length;
      const releasedCount = this.project.versions.filter(
        (v) => v.released,
      ).length;
      this.details.push(
        `**Versions:** ${versionCount} total (${releasedCount} released)`,
      );
    }
  }

  /**
   * Add issue types detail
   */
  private addIssueTypesDetail(): void {
    if (this.project.issueTypes && this.project.issueTypes.length > 0) {
      const issueTypeNames = this.project.issueTypes
        .slice(0, 3)
        .map((it) => it.name);
      const remaining = this.project.issueTypes.length - 3;
      let issueTypesText = `**Issue Types:** ${issueTypeNames.join(", ")}`;
      if (remaining > 0) {
        issueTypesText += ` (+${remaining} more)`;
      }
      this.details.push(issueTypesText);
    }
  }

  /**
   * Generate project URL for quick access
   */
  private getProjectUrl(): string {
    return `#jira-project-${this.project.key}`;
  }

  /**
   * Generate project issues URL for quick access
   */
  private getProjectIssuesUrl(): string {
    return `#jira-issues-${this.project.key}`;
  }

  /**
   * Generate project settings URL for quick access
   */
  private getProjectSettingsUrl(): string {
    return `#jira-settings-${this.project.key}`;
  }
}
