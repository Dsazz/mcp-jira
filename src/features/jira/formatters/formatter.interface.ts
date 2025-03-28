/**
 * Generic formatter interface for converting domain objects to string presentation
 */
export interface Formatter<T> {
  /**
   * Format a domain object into a string representation
   */
  format(data: T): string;
}
