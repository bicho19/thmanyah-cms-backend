import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type EpisodeService from '@/modules/content/services/episode.service';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	AddEpisodeCommand,
	AddEpisodeResponse,
} from '@/modules/content/use-cases/episodes/add-episode/add-episode.types';

type AddEpisodeCommandHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
	[ContainerServicesKeys.PROGRAM]: ProgramService;
};

class AddEpisodeCommandHandler implements CommandHandler<AddEpisodeCommand, AddEpisodeResponse> {
	private readonly episodeService: EpisodeService;
	private readonly programService: ProgramService;

	constructor({ episodeService, programService }: AddEpisodeCommandHandlerProps) {
		this.episodeService = episodeService;
		this.programService = programService;
	}

	async execute(payload: AddEpisodeCommand): Promise<AddEpisodeResponse> {
		// check the program
		const program = await this.programService.retrieve(payload.programId, { fields: ['id'] });
		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${payload.programId} not found`);
		}

		const episode = await this.episodeService.create({
			...payload,
			tags: payload.tags ?? [],
			showNotes: payload.showNotes ?? [],
		});

		return {
			episode,
		};
	}
}

export default AddEpisodeCommandHandler;
