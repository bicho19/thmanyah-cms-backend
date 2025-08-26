import { createHash } from 'node:crypto';
import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type DiscoveryService from '@/modules/discovery/services/discovery.service';
import type {
	FetchDiscoveryProgramsQuery,
	FetchDiscoveryProgramsResponse,
} from '@/modules/discovery/use-cases/fetch-discovery-programs/fetch-discovery-programs-query.types';

type FetchDiscoveryProgramsQueryHandlerProps = {
	[ContainerServicesKeys.DISCOVERY]: DiscoveryService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class FetchDiscoveryProgramsQueryHandler
	implements QueryHandler<FetchDiscoveryProgramsQuery, FetchDiscoveryProgramsResponse>
{
	private readonly discoveryService: DiscoveryService;
	private readonly cacheModule: ICacheModule;

	constructor({ discoveryService, _cache_module }: FetchDiscoveryProgramsQueryHandlerProps) {
		this.discoveryService = discoveryService;
		this.cacheModule = _cache_module;
	}

	async handle(query: FetchDiscoveryProgramsQuery): Promise<FetchDiscoveryProgramsResponse> {
		// Generate the unique cache key for this specific query.
		const cacheKey = this.generateCacheKey(query);

		// Define the cache TTL (Time-To-Live) in seconds.
		// Let's cache search results for 1 hour (3600 seconds). This should be configurable.
		const TTL_SECONDS = 3600;

		// Define the tags for invalidation.
		const cacheTags = ['discovery:programs'];

		// Use the cache module's `remember` function with tagging.
		const availablePrograms = await this.cacheModule.tags(cacheTags).remember<FetchDiscoveryProgramsResponse>(
			cacheKey,
			TTL_SECONDS,
			// This resolver function is ONLY executed if the data is NOT in the cache.
			() =>
				this.discoveryService.searchPrograms({
					...query,
				}),
		);

		// The `remember` method returns the data, either from the cache or fresh from the resolver.
		return availablePrograms;
	}

	/**
	 * A helper method to generate a consistent, unique cache key from the query object.
	 */
	private generateCacheKey(query: FetchDiscoveryProgramsQuery): string {
		// Sort the keys of the object to ensure that {a:1, b:2} and {b:2, a:1} produce the same string.
		const sortedQuery = Object.keys(query)
			.sort()
			.reduce((acc, key) => ({ ...acc, [key]: query[key] }), {});

		// Convert the stable object to a JSON string.
		const queryString = JSON.stringify(sortedQuery);

		// Hash the string to create a short, unique, and safe key for the cache provider (e.g., Redis).
		const hash = createHash('sha256').update(queryString).digest('hex');

		return `discovery:programs:${hash}`;
	}
}
export default FetchDiscoveryProgramsQueryHandler;
