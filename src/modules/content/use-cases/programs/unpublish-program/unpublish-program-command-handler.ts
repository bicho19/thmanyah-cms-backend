import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	UnpublishProgramCommand,
	UnpublishProgramResponse,
} from '@/modules/content/use-cases/programs/unpublish-program/unpublish-program.types';

type UnpublishProgramCommandHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class UnpublishProgramCommandHandler implements CommandHandler<UnpublishProgramCommand, UnpublishProgramResponse> {
	private readonly programService: ProgramService;
	private readonly cacheModule: ICacheModule;

	constructor({ programService, _cache_module }: UnpublishProgramCommandHandlerProps) {
		this.programService = programService;
		this.cacheModule = _cache_module;
	}

	async execute(payload: UnpublishProgramCommand): Promise<UnpublishProgramResponse> {
		const program = await this.programService.retrieve(payload.id);

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${payload.id} not found`);
		}

		if (program.status !== 'published') {
			throw new AppError(AppError.Types.BAD_REQUEST, 'A program must be in a published state to be unpublished');
		}

		const updatedProgram = await this.programService.update({
			id: payload.id,
			status: 'unpublished',
		});

		// Clear the program cache
		// This should clear the cache for the program's slug and the discovery tag
		await this.cacheModule.tags(['discovery:programs', `discovery:program:${updatedProgram.slug}`]).flush();

		return {
			program: updatedProgram,
		};
	}
}

export default UnpublishProgramCommandHandler;
