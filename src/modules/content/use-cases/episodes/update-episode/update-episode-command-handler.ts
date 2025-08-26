import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	UpdateEpisodeCommand,
	UpdateEpisodeResponse,
} from '@/modules/content/use-cases/episodes/update-episode/update-episode.types';

type UpdateEpisodeCommandHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class UpdateEpisodeCommandHandler implements CommandHandler<UpdateEpisodeCommand, UpdateEpisodeResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: UpdateEpisodeCommandHandlerProps) {
		this.episodeService = episodeService;
	}

	async execute(payload: UpdateEpisodeCommand): Promise<UpdateEpisodeResponse> {
		const episode = await this.episodeService.update({
			...payload,
		});

		return {
			episode,
		};
	}
}

export default UpdateEpisodeCommandHandler;
