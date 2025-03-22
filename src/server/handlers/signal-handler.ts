import { logger } from '../../shared/logging';
import { ServerCleanup } from '../types';

const TERMINATION_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'] as const;
type TerminationSignal = typeof TERMINATION_SIGNALS[number];

/**
 * Sets up handlers for common termination signals
 * @param cleanup Function to call when a termination signal is received
 */
export function setupSignalHandlers(cleanup: ServerCleanup): void {
  let isShuttingDown = false;
  
  TERMINATION_SIGNALS.forEach((signal: TerminationSignal) => {
    process.on(signal, () => {
      // Prevent multiple shutdown attempts
      if (isShuttingDown) {
        logger.info(`Received another ${signal} signal during shutdown, forcing exit`, { prefix: 'Server' });
        process.exit(1);
        return;
      }
      
      isShuttingDown = true;
      logger.info(`Received ${signal} signal, initiating graceful shutdown`, { prefix: 'Server' });
      
      // Allow 3 seconds for cleanup before force exiting
      const forceExitTimeout = setTimeout(() => {
        logger.warn('Graceful shutdown timed out, forcing exit', { prefix: 'Server' });
        process.exit(1);
      }, 3000);
      
      // Clear timeout if cleanup completes
      forceExitTimeout.unref();
      
      // Run cleanup
      cleanup(0);
    });
  });
} 