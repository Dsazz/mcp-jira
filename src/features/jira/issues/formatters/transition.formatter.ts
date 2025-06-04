/**
 * Transition formatter
 */
import type { TransitionIssueRequest } from "@features/jira/issues/use-cases/transition.use-cases";
import type { Formatter } from "@features/jira/shared";

/**
 * Formatter class for issue transition requests
 */
export class IssueTransitionFormatter implements Formatter<TransitionIssueRequest, string> {
  /**
   * Format a transition request for the API
   */
  format(request: TransitionIssueRequest) {
    return {
      transition: {
        id: request.transitionId,
      },
      ...(request.fields ? { fields: request.fields } : {}),
    };
  }
}
