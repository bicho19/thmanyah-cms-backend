import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';
import type { CronJobOptions, IJob, IQueueProvider, JobOptions, JobPayload } from '../types';

/**
 * A synchronous "queue" provider for development and testing.
 *
 * This provider does not use a real queue. Instead, it executes jobs
 * immediately and in-process as soon as they are dispatched. This provides
 * an identical interface to a real queue but allows for easy, synchronous
 * debugging without needing a separate worker or Redis instance.
 */
export class SyncQueueProvider implements IQueueProvider {
	private readonly logger: AppLogger;
	private jobHandlers: Map<string, IJob> = new Map();
	private container: AppContainer;

	constructor({ logger }: { logger: AppLogger }) {
		this.logger = logger.child({ provider: 'local-job-provider' });
	}

	async dispatch(jobs: JobPayload | JobPayload[], options?: JobOptions): Promise<void> {
		const jobArray = Array.isArray(jobs) ? jobs : [jobs];

		this.logger.info({ jobNames: jobArray.map((j) => j.name) }, `Dispatching ${jobArray.length} job(s) synchronously.`);

		for (const jobPayload of jobArray) {
			const handler = this.jobHandlers.get(jobPayload.name);
			if (!handler) {
				this.logger.error({ jobName: jobPayload.name }, 'No handler found for synchronous job.');
				// In sync mode, we throw to make the issue immediately obvious.
				throw new Error(`Job handler for "${jobPayload.name}" not found.`);
			}

			try {
				// Execute the job immediately.
				await handler.handle(jobPayload.data, this.container);
			} catch (error) {
				this.logger.error({ error, jobName: jobPayload.name }, 'Synchronous job execution failed.');
				// Re-throw the error to halt execution, as a real queue would mark it as failed.
				throw error;
			}
		}
	}

	// In sync mode, the "worker" just registers the handlers for immediate execution.
	async startWorker(jobHandlers: Map<string, IJob>, container: AppContainer): Promise<void> {
		this.jobHandlers = jobHandlers;
		this.container = container;
		this.logger.info('Sync Queue "worker" started. Jobs will be executed in-process.');
	}

	// Cron jobs are not executed in sync mode as there's no long-running process.
	async registerCronJob(jobPayload: JobPayload, cronOptions: CronJobOptions): Promise<void> {
		this.logger.warn(
			{ jobName: jobPayload.name, pattern: cronOptions.pattern },
			'Cron jobs are ignored in synchronous queue mode.',
		);
	}
}
