import { ContainerInfraKeys } from '@/infra/constants';
import type { IQueueModule } from '@/infra/job/types';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type {
	ScheduleImportCommand,
	ScheduleImportResponse,
} from '@/modules/importer/use-cases/schedule-import/schedule-import.types';

type ScheduleImportHandlerProps = {
	[ContainerInfraKeys.QUEUE_MODULE]: IQueueModule;
};

class ScheduleImportHandler implements CommandHandler<ScheduleImportCommand, ScheduleImportResponse> {
	private readonly queueModule: IQueueModule;

	constructor({ _queue_module }: ScheduleImportHandlerProps) {
		this.queueModule = _queue_module;
	}

	/**
	 * Executes the command to schedule a program import.
	 *
	 * @param payload - The command payload containing the URL to import.
	 * @returns A promise that resolves with the response containing the job ID.
	 */
	async execute(payload: ScheduleImportCommand): Promise<ScheduleImportResponse> {
		const { url } = payload;

		// 1. --- Input Validation ---
		// A simple validation to ensure the URL is present and looks like a URL.
		// More complex validation (e.g., using a library like Zod) could be added here.
		if (!url || !url.startsWith('http')) {
			throw new AppError(AppError.Types.VALIDATION_ERROR, 'A valid URL must be provided for import.');
		}

		// 2. --- Dispatch Job to Queue ---
		// We use the queue module to dispatch a new job.
		// The job name 'ImportProgramJob' must match the name configured in the job handler file.
		// The payload for the job is the URL itself.
		const job = await this.queueModule.dispatch({
			name: 'ImportProgramJob',
			payload: { url },
			// You can pass job-specific options here if your queue module supports it
			// options: {
			// 	attempts: 3,
			// 	delay: 5000 // Delay the first attempt by 5 seconds
			// }
		});

		// 3. --- Return Response ---
		// The response confirms that the job has been successfully queued.
		return {
			jobId: job.id,
			message: 'Program import has been successfully scheduled. It will be processed in the background.',
		};
	}
}

export default ScheduleImportHandler;
