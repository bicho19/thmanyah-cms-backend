import { ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	FetchEpisodesQuery,
	FetchEpisodesResponse,
} from '@/modules/content/use-cases/episodes/fetch-episodes/fetch-episodes.types';

type FetchEpisodesQueryHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class FetchEpisodesQueryHandler implements QueryHandler<FetchEpisodesQuery, FetchEpisodesResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: FetchEpisodesQueryHandlerProps) {
		this.episodeService = episodeService;
	}

	async handle(query: FetchEpisodesQuery): Promise<FetchEpisodesResponse> {
		const episodes = await this.episodeService.list({
			title: query.title,
			status: query.status,
			slug: query.slug,
			programId: query.programId,
		});

		return {
			episodes,
		};
	}
}
export default FetchEpisodesQueryHandler;
