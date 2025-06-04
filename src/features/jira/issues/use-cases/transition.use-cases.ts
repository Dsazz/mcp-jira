/**
 * Issue transition use cases
 * 
 * Types and interfaces for transitioning issue statuses in the workflow
 */

/**
 * Request for transitioning an issue to a different status
 */
export interface TransitionIssueRequest {
  /**
   * ID of the transition to apply
   */
  transitionId: string;
  
  /**
   * Optional fields to update during transition
   */
  fields?: Record<string, unknown>;
} 