/**
 * Base formatter interface
 */
export interface Formatter<T, R> {
  format(input: T): R;
}