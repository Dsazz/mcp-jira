/**
 * Project List Formatter
 *
 * Formats JIRA project lists with comprehensive project information,
 * filtering details, and professional presentation
 */
import type { Project } from "../models";
import { ProjectDetailsBuilder } from "./project-details.builder";

/**
 * Context information for project list formatting
 */
export interface ProjectListContext {
  totalCount?: number;
  hasMore?: boolean;
  searchQuery?: string;
  filterApplied?: boolean;
  orderBy?: string;
}

/**
 * Formatter for JIRA project lists
 * Provides professional formatting with project details and navigation
 */
export class ProjectListFormatter {
  /**
   * Format a list of projects with context information
   *
   * @param projects - Array of projects to format
   * @param context - Additional context for formatting
   * @returns Formatted project list string
   */
  format(projects: Project[], context: ProjectListContext = {}): string {
    if (projects.length === 0) {
      return this.formatEmptyResult(context);
    }

    const sections = [
      this.formatHeader(projects, context),
      this.formatProjectList(projects),
      this.formatFooter(context),
    ];

    return sections.filter(Boolean).join("\n\n");
  }

  /**
   * Format the header with summary information
   */
  private formatHeader(
    projects: Project[],
    context: ProjectListContext,
  ): string {
    const count = projects.length;
    const total = context.totalCount || count;

    let header = "# 📋 JIRA Projects";

    if (context.searchQuery) {
      header += ` - Search: "${context.searchQuery}"`;
    }

    header += `\n\n**Found ${count} project${count !== 1 ? "s" : ""}`;

    if (total > count) {
      header += ` (showing ${count} of ${total})`;
    }

    header += "**";

    if (context.filterApplied) {
      header += " *(filtered)*";
    }

    if (context.orderBy) {
      header += `\n*Ordered by: ${context.orderBy}*`;
    }

    return header;
  }

  /**
   * Format the main project list
   */
  private formatProjectList(projects: Project[]): string {
    return projects
      .map((project, index) => this.formatProject(project, index + 1))
      .join("\n\n");
  }

  /**
   * Format a single project with comprehensive details using ProjectDetailsBuilder
   */
  private formatProject(project: Project, index: number): string {
    const sections = [];
    const builder = new ProjectDetailsBuilder(project);

    // Project header with key and name
    sections.push(`## ${index}. **${project.key}** - ${project.name}`);

    // Project badges
    const badges = builder.buildBadges();
    if (badges.length > 0) {
      sections.push(badges.join(" "));
    }

    // Description
    const description = builder.getDescription();
    if (description) {
      sections.push(`*${description}*`);
    }

    // Project details
    const details = builder.buildDetails();
    if (details.length > 0) {
      sections.push(details.join(" • "));
    }

    // Quick actions
    const actions = builder.buildQuickActions();
    sections.push(`**Quick Actions:** ${actions.join(" | ")}`);

    return sections.join("\n");
  }

  /**
   * Format the footer with navigation and next actions
   */
  private formatFooter(context: ProjectListContext): string {
    const sections = [];

    // Pagination info
    if (context.hasMore) {
      sections.push(
        "📄 **More projects available** - Use `startAt` parameter to load more results",
      );
    }

    // Next actions
    const nextActions = [
      '🔍 **Search projects:** `jira_get_projects searchQuery="project name"`',
      '📂 **Filter by type:** `jira_get_projects typeKey="software"`',
      '📋 **Get project details:** `jira_get_project projectKey="PROJ"`',
      '🎯 **Browse issues:** `jira_search_issues jql="project = PROJ"`',
    ];

    sections.push(`## 🚀 Next Actions\n${nextActions.join("\n")}`);

    // Tips
    const tips = [
      '💡 Use `expand=["description","lead","issueTypes"]` for more details',
      '🔄 Use `orderBy="name"` to sort projects alphabetically',
      "📊 Use `recent=5` to see your recently accessed projects",
    ];

    sections.push(`## 💡 Tips\n${tips.join("\n")}`);

    return sections.join("\n\n");
  }

  /**
   * Format empty result with helpful suggestions
   */
  private formatEmptyResult(context: ProjectListContext): string {
    let message = "# 📋 No Projects Found\n\n";

    if (context.searchQuery) {
      message += `No projects found matching "${context.searchQuery}".\n\n`;
    } else if (context.filterApplied) {
      message += "No projects found with the applied filters.\n\n";
    } else {
      message += "No projects are accessible to your account.\n\n";
    }

    message += "## 🔍 Suggestions\n";
    message += "- Check your search query for typos\n";
    message += "- Try broader search terms\n";
    message += "- Remove filters to see all accessible projects\n";
    message +=
      "- Contact your JIRA administrator if you expect to see projects\n\n";

    message += "## 📝 Examples\n";
    message += "- `jira_get_projects` - List all accessible projects\n";
    message +=
      "- `jira_get_projects searchQuery=\"web\"` - Search for projects containing 'web'\n";
    message +=
      '- `jira_get_projects typeKey="software"` - Filter by software projects\n';
    message +=
      "- `jira_get_projects recent=10` - Show recently accessed projects";

    return message;
  }
}
