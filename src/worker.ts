import { getCurrentDirName } from '@utils/current-dir-name';
import type { IJob, IQueueProvider } from '@/infra/job/types';
import appLogger from '@/infra/logger/logger';
import loadCore from '@/loaders/core-loader';
import { ContainerInfraKeys } from './infra/constants';

/**
 * The main entry point for the background worker process.
 *
 * This script bootstraps the core application, then starts the queue worker
 * to process background jobs. It does not start an API server.
 */
async function startWorker() {
	const logger = appLogger.child({ name: 'worker' });
	logger.info('Starting Worker process...');

	// Load all core application components. This is the same call as in `server.ts`.
	// This ensures the worker has access to the same services, database connections, etc.
	// It also populates the `jobHandlers` map in the container.
	const container = await loadCore({
		rootDirectory: getCurrentDirName(import.meta.url),
		logger: logger,
		isWorker: true,
	});

	// Resolve the necessary components from the container.
	// We need the queue provider instance and the map of all registered job handlers.
	const queueProvider = container.resolve<IQueueProvider>(ContainerInfraKeys.QUEUE_PROVIDER);
	const jobHandlers = container.resolve<Map<string, IJob>>('jobHandlers');

	if (jobHandlers.size === 0) {
		logger.warn('No job handlers were registered. Worker will start but has nothing to do.');
	} else {
		logger.info(`Worker found ${jobHandlers.size} registered job handlers: [${[...jobHandlers.keys()].join(', ')}]`);
	}

	// 3. Start the worker.
	// This is a long-running process that will begin listening to the queue.
	// It will not exit until the process is terminated.
	await queueProvider.startWorker(jobHandlers, container);

	logger.info('✅ Worker successfully started and is listening for jobs.');
}

startWorker().catch((err) => {
	appLogger.setBindings({ name: 'worker' });
	appLogger.fatal({ err }, 'Failed to start Worker process.');
	process.exit(1);
});
