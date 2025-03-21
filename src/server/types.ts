import { z } from 'zod';

export const ServerConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  mcpVersion: z.string(),
  stdio: z.boolean(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

export interface ServerCleanup {
  (exitCode?: number): void;
}

export interface ServerTransportEvents {
  onclose: () => void;
  onerror: (error: Error) => void;
} 