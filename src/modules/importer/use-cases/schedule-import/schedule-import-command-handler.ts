import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { IQueueModule } from '@/infra/job/types';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	ScheduleImportCommand,
	ScheduleImportResponse,
} from '@/modules/importer/use-cases/schedule-import/schedule-import.types';
import type { AppLogger } from '@/types/common';

type ScheduleImportHandlerProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.QUEUE_MODULE]: IQueueModule;
	[ContainerServicesKeys.PROGRAM]: ProgramService;
};

class ScheduleImportCommandHandler implements CommandHandler<ScheduleImportCommand, ScheduleImportResponse> {
	private readonly logger: AppLogger;
	private readonly queueModule: IQueueModule;
	private readonly programService: ProgramService;

	constructor({ logger, _queue_module, programService }: ScheduleImportHandlerProps) {
		(this.logger = logger), (this.queueModule = _queue_module);
		this.programService = programService;
	}

	/**
	 * Executes the command to schedule a program import.
	 *
	 * @param payload - The command payload containing the URL to import.
	 * @returns A promise that resolves with the response containing the job ID.
	 */
	async execute(payload: ScheduleImportCommand): Promise<ScheduleImportResponse> {
		const { url, programId } = payload;

		const program = await this.programService.retrieve(programId);

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${programId} not found`);
		}

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';

		await this.queueModule.dispatch({
			name: 'import-youtube-playlist-job',
			data: {
				url: url,
				programId: programId,
			},
			context: {
				correlationId: correlationId,
			},
		});
		// The response confirms that the job has been successfully queued.
		return {
			message: 'The job has been placed',
		};
	}
}

export default ScheduleImportCommandHandler;
