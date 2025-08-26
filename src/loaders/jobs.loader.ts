import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asClass, asValue } from 'awilix';
import glob from 'fast-glob';
import { ContainerInfraKeys } from '@/infra/constants';
import { QueueModule } from '@/infra/job/job.module';
import { BullMQProvider } from '@/infra/job/providers/bullmq.provider';
import { SyncQueueProvider } from '@/infra/job/providers/local.provider';
import type { IJob, IQueueProvider } from '@/infra/job/types';
import type { AppLogger } from '@/types/common';
import type { LoaderOptions } from '@/types/loader';

const getCurrentDirName = (metaUrl: string) => path.dirname(fileURLToPath(metaUrl));

// This map will be populated by the loader and used by the worker.
export const jobHandlers = new Map<string, IJob>();
export const cronJobs = new Map<string, any>();

/**
 * Loader for the entire Queue & Job system.
 * It initializes the configured provider and scans for all job files.
 */
export default async ({ container, configModule }: LoaderOptions): Promise<void> => {
	const logger: AppLogger = container.resolve(ContainerInfraKeys.LOGGER);
	const queueConfig = configModule.queue;

	if (!queueConfig || !queueConfig.enabled) {
		logger.warn('Queue module is disabled. Skipping initialization.');
		// Register a dummy module so the app doesn't crash if it's injected.
		container.register(
			ContainerInfraKeys.QUEUE_MODULE,
			asValue({
				dispatch: () => {
					logger.warn('Queue is disabled; dispatch call ignored.');
					return Promise.resolve();
				},
			}),
		);
		return;
	}

	logger.info('------  Initializing Queue Module ------ ');
	const providerId = queueConfig.provider ?? 'sync';
	let providerInstance: IQueueProvider;

	if (providerId === 'bullmq') {
		if (!queueConfig.redisUrl) {
			throw new Error('BullMQ provider is selected, but `queue.redisUrl` is not configured.');
		}
		const redisConnection = container.resolve(ContainerInfraKeys.REDIS_CONNECTION);
		providerInstance = new BullMQProvider({ logger, redisConnection }, queueConfig.bullmqOptions);
	} else {
		providerInstance = new SyncQueueProvider({ logger });
	}

	container.register(ContainerInfraKeys.QUEUE_PROVIDER, asValue(providerInstance));
	container.register(ContainerInfraKeys.QUEUE_MODULE, asClass(QueueModule).scoped());

	// --- Job Loading ---
	logger.info('Loading jobs and cron schedules...');
	const jobsPath = '../modules/**/jobs/*.ts';
	const resolvedPath = path.join(getCurrentDirName(import.meta.url), jobsPath);
	const jobFiles = glob.sync(resolvedPath);

	for (const file of jobFiles) {
		const jobModule = await import(path.resolve(file));
		const JobClass = jobModule.default;
		const jobConfig = jobModule.config;

		if (JobClass) {
			const jobName = jobConfig?.name || JobClass.name;
			const jobInstance = new JobClass(); // Jobs are simple classes, no DI needed for the handler itself
			jobHandlers.set(jobName, jobInstance);
			logger.debug(`Loaded job handler: "${jobName}"`);

			// Check for and register cron jobs
			if (jobConfig?.cron) {
				cronJobs.set(jobName, { jobConfig, cronPattern: jobConfig.cron });
			}
		}
	}
};
