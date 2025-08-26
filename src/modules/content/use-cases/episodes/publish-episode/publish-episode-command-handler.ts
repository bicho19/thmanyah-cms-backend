import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	PublishEpisodeCommand,
	PublishEpisodeResponse,
} from '@/modules/content/use-cases/episodes/publish-episode/publish-episode.types';

type PublishEpisodeCommandHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class PublishEpisodeCommandHandler implements CommandHandler<PublishEpisodeCommand, PublishEpisodeResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: PublishEpisodeCommandHandlerProps) {
		this.episodeService = episodeService;
	}

	async execute(payload: PublishEpisodeCommand): Promise<PublishEpisodeResponse> {
		const episode = await this.episodeService.retrieve(payload.id, { populate: ['mediaFiles'] });

		if (!episode) {
			throw new AppError(AppError.Types.NOT_FOUND, `Episode with id ${payload.id} not found`);
		}

		if (episode.status !== 'draft' && episode.status !== 'unpublished') {
			throw new AppError(
				AppError.Types.BAD_REQUEST,
				'An episode must be in a draft or unpublished state to be published',
			);
		}

		if (episode.mediaFiles.length === 0) {
			throw new AppError(AppError.Types.BAD_REQUEST, 'An episode must have at least one media file to be published');
		}

		const updatedEpisode = await this.episodeService.update({
			id: payload.id,
			status: 'published',
			publishDate: new Date(),
		});

		return {
			episode: updatedEpisode,
		};
	}
}

export default PublishEpisodeCommandHandler;
