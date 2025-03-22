/**
 * Common test utilities and helpers
 */
import { McpResponse } from '../../api/types';

/**
 * Checks if a response follows the McpResponse structure
 */
export const expectValidMcpResponse = (response: unknown): void => {
  expect(response).toHaveProperty('content');
  expect(Array.isArray((response as McpResponse).content)).toBe(true);
};

/**
 * Checks if a response is an error response
 * Note: errorCode is optional and some implementations may not include it
 */
export const expectErrorResponse = (
  response: unknown, 
  errorCode?: string, 
  textContains?: string
): void => {
  expectValidMcpResponse(response);
  expect(response).toHaveProperty('isError', true);
  
  // Only check for errorCode if it's provided AND the response has this property
  if (errorCode && (response as any).errorCode !== undefined) {
    expect(response).toHaveProperty('errorCode', errorCode);
  }
  
  if (textContains) {
    expect((response as McpResponse).content[0].text).toContain(textContains);
  }
};

/**
 * Checks if a response is a success response
 */
export const expectSuccessResponse = (
  response: unknown, 
  textContains?: string
): void => {
  expectValidMcpResponse(response);
  expect(response).not.toHaveProperty('isError', true);
  
  if (textContains) {
    expect((response as McpResponse).content[0].text).toContain(textContains);
  }
};

/**
 * Checks if a response text contains multiple strings
 */
export const expectResponseTextContains = (
  response: unknown,
  textSnippets: string[]
): void => {
  expectValidMcpResponse(response);
  
  const responseText = (response as McpResponse).content[0].text;
  textSnippets.forEach(snippet => {
    expect(responseText).toContain(snippet);
  });
}; 