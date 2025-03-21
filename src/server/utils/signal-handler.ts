import { logger } from '../../shared/logger';

const TERMINATION_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'] as const;

export function setupSignalHandlers(cleanup: (exitCode: number) => void): void {
  TERMINATION_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Received ${signal} signal`, { prefix: 'Server', isMcp: true });
      cleanup(0);
    });
  });
} 