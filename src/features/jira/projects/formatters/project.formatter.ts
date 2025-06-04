/**
 * Project formatter
 */

import type { Formatter } from "../../shared/formatters/formatter.interface";
import type { Project } from "../models/project.models";

/**
 * Formatter class for project data
 */
export class ProjectFormatter implements Formatter<Project, string> {
  /**
   * Format a project for display
   */
  format(project: Project): string {
    if (!project) {
      return "";
    }

    // Basic project details
    let formattedProject = `# ${project.key}: ${project.name}\n\n`;

    // Project metadata
    formattedProject += `**ID:** ${project.id}\n`;
    formattedProject += `**Type:** ${project.projectTypeKey || "Standard"}\n`;
    formattedProject += `**Style:** ${project.style || "Classic"}\n`;
    formattedProject += `**Visibility:** ${project.isPrivate ? "Private" : "Public"}\n`;

    // Optional fields
    if (project.lead) {
      formattedProject += `**Lead:** ${project.lead.displayName}\n`;
    }

    if (project.projectCategory) {
      formattedProject += `**Category:** ${project.projectCategory.name}\n`;
    }

    if (project.avatarUrls) {
      formattedProject += `**Avatar:** ![Project Avatar](${Object.values(project.avatarUrls)[0] || ""})\n`;
    }

    // URL
    formattedProject += `\n**URL:** [${project.key}](${project.self})\n`;

    return formattedProject;
  }
}
