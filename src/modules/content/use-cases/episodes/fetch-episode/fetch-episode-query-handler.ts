import { ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import AppError from '@/lib/exceptions/errors';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	FetchEpisodeQuery,
	FetchEpisodeResponse,
} from '@/modules/content/use-cases/episodes/fetch-episode/fetch-episode.types';

type FetchEpisodeQueryHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class FetchEpisodeQueryHandler implements QueryHandler<FetchEpisodeQuery, FetchEpisodeResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: FetchEpisodeQueryHandlerProps) {
		this.episodeService = episodeService;
	}

	async handle(query: FetchEpisodeQuery): Promise<FetchEpisodeResponse> {
		const episode = await this.episodeService.retrieve(query.id, {
			populate: ['program'],
		});

		if (!episode) {
			throw new AppError(AppError.Types.NOT_FOUND, `Episode with id ${query.id} not found`);
		}

		return {
			episode,
		};
	}
}

export default FetchEpisodeQueryHandler;
