import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	UnpublishEpisodeCommand,
	UnpublishEpisodeResponse,
} from '@/modules/content/use-cases/episodes/unpublish-episode/unpublish-episode.types';

type UnpublishEpisodeCommandHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class UnpublishEpisodeCommandHandler implements CommandHandler<UnpublishEpisodeCommand, UnpublishEpisodeResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: UnpublishEpisodeCommandHandlerProps) {
		this.episodeService = episodeService;
	}

	async execute(payload: UnpublishEpisodeCommand): Promise<UnpublishEpisodeResponse> {
		const episode = await this.episodeService.retrieve(payload.id);

		if (!episode) {
			throw new AppError(AppError.Types.NOT_FOUND, `Episode with id ${payload.id} not found`);
		}

		if (episode.status !== 'published') {
			throw new AppError(AppError.Types.BAD_REQUEST, 'An episode must be in a published state to be unpublished');
		}

		const updatedEpisode = await this.episodeService.update({
			id: payload.id,
			status: 'unpublished',
      publishDate: null,
		});

		return {
			episode: updatedEpisode,
		};
	}
}

export default UnpublishEpisodeCommandHandler;
