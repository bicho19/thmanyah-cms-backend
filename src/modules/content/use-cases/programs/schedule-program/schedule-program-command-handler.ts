import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	ScheduleProgramCommand,
	ScheduleProgramResponse,
} from '@/modules/content/use-cases/programs/schedule-program/schedule-program.types';

type ScheduleProgramCommandHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
};

class ScheduleProgramCommandHandler implements CommandHandler<ScheduleProgramCommand, ScheduleProgramResponse> {
	private readonly programService: ProgramService;

	constructor({ programService }: ScheduleProgramCommandHandlerProps) {
		this.programService = programService;
	}

	async execute(payload: ScheduleProgramCommand): Promise<ScheduleProgramResponse> {
		const program = await this.programService.retrieve(payload.id);

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${payload.id} not found`);
		}

		if (program.status !== 'draft' && program.status !== 'unpublished') {
			throw new AppError(
				AppError.Types.BAD_REQUEST,
				'A program must be in a draft or unpublished state to be scheduled',
			);
		}

		const updatedProgram = await this.programService.update({
			id: payload.id,
			status: 'scheduled',
			scheduledPublishAt: payload.scheduledPublishAt,
		});

		return {
			program: updatedProgram,
		};
	}
}

export default ScheduleProgramCommandHandler;
