import { ContainerInfraKeys } from '@/infra/constants';
import type { AppLogger } from '@/types/common';
import type { IQueueModule, IQueueProvider, JobContext, JobOptions, JobPayload } from './types';

/**
 * Dependencies for the public WorkflowModule façade.
 */
type QueueModuleModuleDeps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.QUEUE_PROVIDER]: IQueueProvider;
};

/**
 * The public-facing service for dispatching jobs to the queue.
 * This class acts as a façade, providing a clean API to the application
 * while delegating the actual work to the configured queue provider.
 */
export class QueueModule implements IQueueModule {
	private readonly provider: IQueueProvider;
	private readonly logger: AppLogger;

	constructor({ __queue_provider__, logger }: QueueModuleModuleDeps) {
		this.provider = __queue_provider__;
		this.logger = logger;
	}

	dispatch(jobs: JobPayload | JobPayload[], options?: JobOptions): Promise<void> {
		// Automatically enrich the job(s) with context from the current scope.
		const enrich = (job: JobPayload): JobPayload => {
			const bindings = this.logger.bindings() || {};
			const context: JobContext = {
				correlationId: bindings.correlationId,
			};
			return { ...job, context };
		};

		const enrichedJobs = Array.isArray(jobs) ? jobs.map(enrich) : enrich(jobs);
		return this.provider.dispatch(enrichedJobs, options);
	}
}
