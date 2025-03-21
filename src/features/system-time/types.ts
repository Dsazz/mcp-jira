import { z } from 'zod';

export const SystemTimeSchema = z.object({
  format: z.string().optional().describe('Date format string following date-fns format')
});

export type SystemTimeOptions = z.infer<typeof SystemTimeSchema>;

export interface SystemTimeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
} 