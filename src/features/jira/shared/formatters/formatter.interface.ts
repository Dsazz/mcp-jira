/**
 * Base formatter interface with default string return type
 */
export interface Formatter<T, R = string> {
  format(input: T): R;
}

/**
 * Type alias for string formatters (most common case)
 */
export type StringFormatter<T> = Formatter<T, string>;
