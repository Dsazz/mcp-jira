import { format } from 'date-fns';

export function formatDate(date: Date, formatString?: string): string {
  try {
    return format(date, formatString || 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    throw new Error(`Failed to format date: ${error instanceof Error ? error.message : String(error)}`);
  }
} 