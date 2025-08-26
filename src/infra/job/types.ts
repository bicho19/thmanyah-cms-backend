import type { AppContainer } from '@/lib/app-container';

/**
 * The context that is automatically captured and passed to every job.
 * This ensures traceability and access to request-scoped dependencies.
 */
export type JobContext = {
	correlationId?: string;
	// Can be extended with other context like tenantId, userId, etc.
};

/**
 * The main payload for a job.
 * @template T - The type of the data payload for the job.
 */
export type JobPayload<T = any> = {
	/** A unique name identifying the job handler. e.g., 'process-image-job' */
	name: string;
	/** The specific data required for this job instance to execute. */
	data: T;
	/** Context captured from where the job was dispatched. */
	context: JobContext;
};

/**
 * Options for configuring a job's execution behavior.
 */
export type JobOptions = {
	/** Delay job execution by this many milliseconds. */
	delay?: number;
	/** Number of attempts to retry the job if it fails. @default 1 */
	attempts?: number;
	/** Backoff strategy for retries (e.g., 'fixed' or 'exponential'). */
	backoff?: {
		type: 'fixed' | 'exponential';
		delay: number; // The base delay in milliseconds.
	};
};

/**
 * Configuration for a cron job (repeatable job).
 */
export type CronJobOptions = {
	/** A standard cron pattern string. e.g., '0 0 * * *' for midnight daily. */
	pattern: string;
	/** Options for the job execution itself. */
	jobOptions?: Omit<JobOptions, 'delay'>;
};

/**
 * The contract that every self-contained job must adhere to.
 * This is the class that developers will create for their business logic.
 */
export interface IJob<T = any> {
	/**
	 * The core logic of the job.
	 * @param payload - The specific data for this job instance.
	 * @param container - A DI container to resolve any necessary services.
	 */
	handle(payload: T, container: AppContainer): Promise<void>;
}

/**
 * The contract for a Queue Provider (the backend implementation, e.g., BullMQ).
 */
export interface IQueueProvider {
	/**
	 * Dispatches a single job or a chain of jobs to the queue.
	 * @param jobs - A single job payload or an array representing a chain.
	 * @param options - Execution options for the job(s).
	 */
	dispatch(jobs: JobPayload | JobPayload[], options?: JobOptions): Promise<void>;

	/**
	 * Starts a worker process to listen to the queue and execute jobs.
	 * @param jobHandlers - A map of job names to their handler classes.
	 * @param container - The main DI container to pass to job handlers.
	 */
	startWorker(jobHandlers: Map<string, IJob>, container: AppContainer): Promise<void>;

	/**
	 * Registers a repeatable cron job.
	 * @param jobPayload - The job to run on a schedule.
	 * @param cronOptions - The cron configuration.
	 */
	registerCronJob(jobPayload: JobPayload, cronOptions: CronJobOptions): Promise<void>;
}

/**
 * The public interface for the main Queue Module that the application uses.
 */
export interface IQueueModule {
	/**
	 * Dispatches one or more jobs to be processed asynchronously.
	 *
	 * @example
	 * // Dispatch a single job
	 * queueModule.dispatch({ name: 'send-welcome-email', data: { userId: 123 } });
	 *
	 * // Dispatch a chain of jobs (a pipeline)
	 * queueModule.dispatch([
	 *   { name: 'download-video', data: { url: '...' } },
	 *   { name: 'transcode-video', data: {} }, // Data can be passed from previous job's result
	 *   { name: 'notify-user', data: {} }
	 * ]);
	 *
	 * @param jobs - A single job payload or an array of jobs to be executed in a sequence.
	 * @param options - Options like delay and retries.
	 */
	dispatch(jobs: JobPayload | JobPayload[], options?: JobOptions): Promise<void>;
}
