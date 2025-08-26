import { asValue } from 'awilix';
import { FlowProducer, type JobsOptions, Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';
import type { CronJobOptions, IJob, IQueueProvider, JobOptions, JobPayload } from '../types';

type BullMQOptions = {
	queueName?: string;
	prefix?: string;
	defaultJobOptions?: JobsOptions;
};

/**
 * A robust, Redis-backed queue provider using the BullMQ library.
 * This is the recommended provider for production environments.
 */
export class BullMQProvider implements IQueueProvider {
	private readonly logger: AppLogger;
	private readonly queue: Queue;
	private readonly flowProducer: FlowProducer;
	private worker?: Worker;

	constructor({ logger, redisConnection }: { logger: AppLogger; redisConnection: Redis }, options: BullMQOptions = {}) {
		this.logger = logger.child({ provider: 'bullmq-job-provider' });
		const queueName = options.queueName ?? 'default-queue';
		const connection = redisConnection;

		this.queue = new Queue(queueName, {
			connection,
			prefix: options.prefix,
			defaultJobOptions: options.defaultJobOptions,
		});

		this.flowProducer = new FlowProducer({ connection, prefix: options.prefix });
	}

	async dispatch(jobs: JobPayload | JobPayload[], options?: JobOptions): Promise<void> {
		const bullOptions: JobsOptions = {
			delay: options?.delay,
			attempts: options?.attempts,
			backoff: options?.backoff,
		};

		if (!Array.isArray(jobs)) {
			// Single job
			await this.queue.add(jobs.name, jobs, bullOptions);
		} else {
			// Chained jobs (flow)
			if (jobs.length === 0) return;

			const flow = {
				name: jobs[0].name,
				queueName: this.queue.name,
				data: jobs[0],
				opts: bullOptions,
				children: this.buildFlow(jobs.slice(1)),
			};
			await this.flowProducer.add(flow);
		}
	}

	// Helper to recursively build a flow for chained jobs
	private buildFlow(jobs: JobPayload[]) {
		if (jobs.length === 0) return [];
		return [
			{
				name: jobs[0]?.name,
				queueName: this.queue.name,
				data: jobs[0],
				children: this.buildFlow(jobs.slice(1)),
			},
		];
	}

	async startWorker(jobHandlers: Map<string, IJob>, container: AppContainer): Promise<void> {
		this.worker = new Worker(
			this.queue.name,
			async (job) => {
				const { name, data: jobPayload } = job;
				const handler = jobHandlers.get(name);

				const { correlationId } = jobPayload.context;
				const workerLogger = this.logger.child({
					jobName: name,
					jobId: job.id,
					correlationId,
				});

				if (!handler) {
					workerLogger.error('No handler found for job.');
					throw new Error(`Job handler for "${name}" not found.`);
				}

				workerLogger.info('Starting job execution.');
				try {
					// Create a scoped container for this job run to resolve scoped services.
					const scope = container.createScope();
					scope.register('logger', asValue(workerLogger));

					await handler.handle(jobPayload.data, scope as AppContainer);
					workerLogger.info('Job execution completed successfully.');
				} catch (error) {
					workerLogger.error({ error }, 'Job execution failed.');
					// Re-throw the error so BullMQ marks the job as failed and handles retries.
					throw error;
				}
			},
			{ connection: this.queue.opts.connection, prefix: this.queue.opts.prefix },
		);

		this.logger.info(`BullMQ Worker started. Listening to queue: "${this.queue.name}".`);
	}

	async registerCronJob(jobPayload: JobPayload, cronOptions: CronJobOptions): Promise<void> {
		await this.queue.add(jobPayload.name, jobPayload, {
			...cronOptions.jobOptions,
			repeat: {
				pattern: cronOptions.pattern,
			},
		});
		this.logger.info({ jobName: jobPayload.name, pattern: cronOptions.pattern }, 'Registered cron job.');
	}
}
