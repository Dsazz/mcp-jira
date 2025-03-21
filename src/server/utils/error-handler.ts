import { logger } from '../../shared/logger';

export function setupErrorHandlers(cleanup: (exitCode: number) => void): void {
  process.on('uncaughtException', (error) => {
    logger.error(error, { prefix: 'Server', isMcp: true });
    cleanup(1);
  });

  process.on('unhandledRejection', (error) => {
    logger.error(error instanceof Error ? error : new Error(String(error)), { 
      prefix: 'Server', 
      isMcp: true 
    });
    cleanup(1);
  });
}

export function handleError(error: unknown, context: string): never {
  logger.error(error instanceof Error ? error : new Error(String(error)), { 
    prefix: `Server:${context}`, 
    isMcp: true 
  });
  process.exit(1);
} 