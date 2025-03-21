/**
 * Centralized error handling for MCP tools
 */
import { ApiError, NotFoundError, AuthorizationError, ValidationError } from './api-errors';
import { logger } from '../../../shared/logger';
import { McpResponse } from '../api/types';

/**
 * Convert any error to a standardized MCP response
 */
export function handleError(error: unknown): McpResponse {
  // Log the error first
  logError(error);
  
  if (error instanceof ValidationError) {
    return {
      content: [{ type: 'text', text: error.message }],
      isError: true,
      errorCode: 'VALIDATION_ERROR'
    };
  }
  
  if (error instanceof NotFoundError) {
    return {
      content: [{ type: 'text', text: error.message }],
      isError: true,
      errorCode: error.errorCode
    };
  }
  
  if (error instanceof AuthorizationError) {
    return {
      content: [{ 
        type: 'text', 
        text: 'Failed to authorize with JIRA. Please check your credentials.' 
      }],
      isError: true,
      errorCode: error.errorCode
    };
  }
  
  if (error instanceof ApiError) {
    return {
      content: [{ type: 'text', text: error.message }],
      isError: true,
      errorCode: error.errorCode
    };
  }
  
  // Generic error handling
  const message = error instanceof Error 
    ? error.message 
    : 'An unknown error occurred';
    
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
    errorCode: 'UNKNOWN_ERROR'
  };
}

/**
 * Log error with appropriate level and context
 */
function logError(error: unknown): void {
  const errorObject = error instanceof Error 
    ? error 
    : new Error(String(error));
    
  // Determine logging level based on error type
  if (error instanceof ValidationError) {
    logger.warn(errorObject, { prefix: 'JIRA', isMcp: true });
  } else if (error instanceof NotFoundError) {
    logger.info(errorObject, { prefix: 'JIRA', isMcp: true });
  } else {
    logger.error(errorObject, { prefix: 'JIRA', isMcp: true });
  }
} 