import { createHash } from 'node:crypto';
import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type DiscoveryService from '@/modules/discovery/services/discovery.service';
import type {
	FetchProgramEpisodesQuery,
	FetchProgramEpisodesResponse,
} from '@/modules/discovery/use-cases/fetch-program-episodes/fetch-program-episodes-query.types';

type FetchProgramEpisodesQueryHandlerProps = {
	[ContainerServicesKeys.DISCOVERY]: DiscoveryService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class FetchProgramEpisodesQueryHandler
	implements QueryHandler<FetchProgramEpisodesQuery, FetchProgramEpisodesResponse>
{
	private readonly discoveryService: DiscoveryService;
	private readonly cacheModule: ICacheModule;

	constructor({ discoveryService, _cache_module }: FetchProgramEpisodesQueryHandlerProps) {
		this.discoveryService = discoveryService;
		this.cacheModule = _cache_module;
	}

	async handle(query: FetchProgramEpisodesQuery): Promise<FetchProgramEpisodesResponse> {
		const cacheKey = this.generateCacheKey(query);
		const TTL_SECONDS = 3600; // 1 hour
		const cacheTags = [`discovery:programs:${query.programSlug}:episodes`];

		return await this.cacheModule
			.tags(cacheTags)
			.remember<FetchProgramEpisodesResponse>(cacheKey, TTL_SECONDS, () =>
				this.discoveryService.searchProgramEpisodes(query),
			);
	}

	/**
	 * A helper method to generate a consistent, unique cache key from the query object.
	 */
	private generateCacheKey(query: FetchProgramEpisodesQuery): string {
		// Sort the keys of the object to ensure that {a:1, b:2} and {b:2, a:1} produce the same string.
		const sortedQuery = Object.keys(query)
			.sort()
			.reduce((acc, key) => ({ ...acc, [key]: query[key] }), {});

		// Convert the stable object to a JSON string.
		const queryString = JSON.stringify(sortedQuery);

		// Hash the string to create a short, unique, and safe key for the cache provider (e.g., Redis).
		const hash = createHash('sha256').update(queryString).digest('hex');

		return `discovery:episodes:${hash}`;
	}
}

export default FetchProgramEpisodesQueryHandler;
