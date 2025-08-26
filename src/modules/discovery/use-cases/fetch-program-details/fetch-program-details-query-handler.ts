import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type DiscoveryService from '@/modules/discovery/services/discovery.service';
import type {
	FetchProgramDetailsQuery,
	FetchProgramDetailsResponse,
} from '@/modules/discovery/use-cases/fetch-program-details/fetch-program-details-query.types';

type FetchProgramDetailsQueryHandlerProps = {
	[ContainerServicesKeys.DISCOVERY]: DiscoveryService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class FetchProgramDetailsQueryHandler
	implements QueryHandler<FetchProgramDetailsQuery, FetchProgramDetailsResponse>
{
	private readonly discoveryService: DiscoveryService;
	private readonly cacheModule: ICacheModule;

	constructor({ discoveryService, _cache_module }: FetchProgramDetailsQueryHandlerProps) {
		this.discoveryService = discoveryService;
		this.cacheModule = _cache_module;
	}

	async handle(query: FetchProgramDetailsQuery): Promise<FetchProgramDetailsResponse> {
		const cacheKey = `discovery:program:${query.slug}`;
		const TTL_SECONDS = 3600; // 1 hour
		const cacheTags = [`program:${query.slug}`];

		return await this.cacheModule.tags(cacheTags).remember<FetchProgramDetailsResponse>(
			cacheKey,
			TTL_SECONDS,
			() => this.discoveryService.findProgramBySlug(query.slug),
		);
	}
}

export default FetchProgramDetailsQueryHandler;
