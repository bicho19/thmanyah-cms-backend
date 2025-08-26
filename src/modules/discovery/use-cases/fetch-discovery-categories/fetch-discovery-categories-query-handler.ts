import { createHash } from 'node:crypto';
import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type DiscoveryService from '@/modules/discovery/services/discovery.service';
import type {
	FetchDiscoveryCategoriesQuery,
	FetchDiscoveryCategoriesResponse,
} from '@/modules/discovery/use-cases/fetch-discovery-categories/fetch-discovery-categories-query.types';

type FetchDiscoveryProgramsQueryHandlerProps = {
	[ContainerServicesKeys.DISCOVERY]: DiscoveryService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class FetchDiscoveryCategoriesQueryHandler
	implements QueryHandler<FetchDiscoveryCategoriesQuery, FetchDiscoveryCategoriesResponse>
{
	private readonly discoveryService: DiscoveryService;
	private readonly cacheModule: ICacheModule;

	constructor({ discoveryService, _cache_module }: FetchDiscoveryProgramsQueryHandlerProps) {
		this.discoveryService = discoveryService;
		this.cacheModule = _cache_module;
	}

	async handle(query: FetchDiscoveryCategoriesQuery): Promise<FetchDiscoveryCategoriesResponse> {
		// Generate the unique cache key for this specific query.
		const cacheKey = this.generateCacheKey();

		// Define the cache TTL (Time-To-Live) in seconds.
		// Let's cache search results for 1 hour (3600 seconds).
		const TTL_SECONDS = 3600;

		// Define the tags for invalidation.
		const cacheTags = ['categories:discovery'];

		// Use the cache module's `remember` function with tagging.
		// The `remember` method returns the data, either from the cache or fresh from the resolver.
		return await this.cacheModule.tags(cacheTags).remember<FetchDiscoveryCategoriesResponse>(
			cacheKey,
			TTL_SECONDS,
			// This resolver function is ONLY executed if the data is NOT in the cache.
			() => this.discoveryService.searchCategories(),
		);
	}

	/**
	 * A helper method to generate a consistent, unique cache key from the query object.
	 */
	private generateCacheKey(): string {
		// Hash the string to create a short, unique, and safe key for the cache provider
		return 'discovery:categories';
	}
}
export default FetchDiscoveryCategoriesQueryHandler;
