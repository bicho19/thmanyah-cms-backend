import { asValue } from 'awilix';
import { ContainerInfraKeys } from '@/infra/constants';
import type { IJob } from '@/infra/job/types';
import { type AppContainer, createAppContainer } from '@/lib/app-container';
import cacheLoader from '@/loaders/cache.loader';
import eventBusLoader from '@/loaders/event-bus.loader';
import fileServiceLoader from '@/loaders/file-service.loader';
import jobsLoader from '@/loaders/jobs.loader';
import subscribersLoader from '@/loaders/subscribers.loader';
import type { AppLogger } from '@/types/common';
import loadConfig from './config';
import databaseLoader from './database.loader';
import entitiesLoader from './entities.loader';
import handlersLoader from './handlers.loader';
import modulesLoader from './modules-loader.loader';
import redisLoader from './redis.loader';
import servicesLoader from './services.loader';

type CoreLoaderProps = {
	rootDirectory: string;
	logger: AppLogger;
	isWorker: boolean;
};

/**
 * The Core Application Loader.
 *
 * This function is responsible for bootstrapping all shared application components,
 * including the DI container, database connections, and core infrastructure modules.
 * It is designed to be called by any entry point process (e.g., API server, worker).
 *
 * It intentionally does NOT load API-specific components like routes or controllers.
 */
export default async function loadCore({ rootDirectory, logger, isWorker }: CoreLoaderProps): Promise<AppContainer> {
	// Fetch the app config module
	const configModule = await loadConfig(rootDirectory);

	// Create app container
	const container = createAppContainer();

	// Add the config module to the container
	container.register(ContainerInfraKeys.CONFIG_MODULE, asValue(configModule));
	container.register(ContainerInfraKeys.LOGGER, asValue(logger));

	logger.info('--- Bootstrapping Core Application ---');

	// --- Infrastructure Initialization ---
	await databaseLoader({ container, logger, configModule });
	const { shutdown: redisShutdown } = await redisLoader({ container, configModule, logger });
	await entitiesLoader({ container, logger, configModule });

	// --- Core Module Loaders ---
	// These modules provide foundational services used throughout the app.
	await eventBusLoader({ container, configModule, logger });
	await fileServiceLoader({ container, configModule, logger });

	// --- Queue and Workflow Loaders (CRITICAL FOR WORKER) ---
	// Create the empty map that loaders will populate. This is essential.
	const jobHandlers = new Map<string, IJob>();
	container.register('jobHandlers', asValue(jobHandlers));

	// Load the queue module itself.
	await jobsLoader({ container, configModule, logger });

	// --- Application-Level Loaders ---
	await servicesLoader({ container, configModule, logger });

	// Subscribers are needed in both processes, as API actions or jobs can emit events.
	await subscribersLoader({ container, logger });

	// The handlers are not needed for the worker
	if (!isWorker) {
		await modulesLoader({ container, configModule, logger });
		await handlersLoader({ container });
		await cacheLoader({ container, configModule, logger });
	}

	logger.info('--- Core Application Bootstrapped Successfully ---');

	return container;
}
