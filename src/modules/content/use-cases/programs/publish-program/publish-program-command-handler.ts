import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type EpisodeService from '@/modules/content/services/episode.service';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	PublishProgramCommand,
	PublishProgramResponse,
} from '@/modules/content/use-cases/programs/publish-program/publish-program.types';

type PublishProgramCommandHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
	[ContainerServicesKeys.EPISODE]: EpisodeService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class PublishProgramCommandHandler implements CommandHandler<PublishProgramCommand, PublishProgramResponse> {
	private readonly programService: ProgramService;
	private readonly episodeService: EpisodeService;
	private readonly cacheModule: ICacheModule;

	constructor({ programService, episodeService, _cache_module }: PublishProgramCommandHandlerProps) {
		this.programService = programService;
		this.episodeService = episodeService;
		this.cacheModule = _cache_module;
	}

	async execute(payload: PublishProgramCommand): Promise<PublishProgramResponse> {
		const program = await this.programService.retrieve(payload.id);

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${payload.id} not found`);
		}

		const totalPublishedEpisodes = await this.episodeService.count({ programId: payload.id, status: 'published' });

		if (totalPublishedEpisodes === 0) {
			throw new AppError(
				AppError.Types.BAD_REQUEST,
				'A program must have at least one published episode to be published',
			);
		}

		const updatedProgram = await this.programService.update({
			id: payload.id,
			status: 'published',
			publishedAt: new Date(),
		});

		// Clear the program cache
		await this.cacheModule.tags(['discovery:programs']).flush();

		return {
			program: updatedProgram,
		};
	}
}

export default PublishProgramCommandHandler;
