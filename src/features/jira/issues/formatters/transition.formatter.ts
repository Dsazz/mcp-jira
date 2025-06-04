/**
 * Transition formatter
 */
import type { TransitionIssueRequest } from "@features/jira/issues/use-cases/transition.use-cases";
import type { StringFormatter } from "@features/jira/shared";

/**
 * Formatter class for issue transition requests - formats for display
 */
export class IssueTransitionFormatter
  implements StringFormatter<TransitionIssueRequest>
{
  /**
   * Format a transition request for display
   */
  format(request: TransitionIssueRequest): string {
    const sections: string[] = [];

    // Header
    sections.push("# 🔄 Issue Transition");

    // Transition information
    sections.push(`**Transition ID:** ${request.transitionId}`);

    // Fields being updated
    if (request.fields && Object.keys(request.fields).length > 0) {
      sections.push("**Fields to Update:**");
      for (const [key, value] of Object.entries(request.fields)) {
        sections.push(`• **${key}:** ${JSON.stringify(value)}`);
      }
    }

    return sections.join("\n\n");
  }
}
