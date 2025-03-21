import { formatDate } from '../utils/format';
import { SystemTimeOptions, SystemTimeResponse } from '../types';
import { logger } from '../../../shared/logger';

export function getSystemTimeHandler(options?: SystemTimeOptions): SystemTimeResponse {
  try {
    const formattedTime = formatDate(new Date(), options?.format);
    
    return {
      content: [{
        type: 'text',
        text: formattedTime
      }]
    };
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'System Time Handler', 
      isMcp: true 
    });
    
    return {
      content: [{
        type: 'text',
        text: error instanceof Error ? error.message : 'Failed to format system time'
      }],
      isError: true
    };
  }
} 