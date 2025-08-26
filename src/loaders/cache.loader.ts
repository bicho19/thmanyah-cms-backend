import { asClass, asValue } from 'awilix';
import { CacheModule } from '@/infra/cache/cache.module';
import type { ICacheProvider } from '@/infra/cache/cache.types';
import { InMemoryCacheProvider } from '@/infra/cache/providers/in-memory-cache.provider';
import { RedisCacheProvider } from '@/infra/cache/providers/redis-cache.provider';
import { ContainerInfraKeys } from '@/infra/constants';
import type { LoaderOptions } from '@/types/loader';

export default async ({ container, configModule }: LoaderOptions) => {
	const logger = container.resolve(ContainerInfraKeys.LOGGER);
	const providerId = configModule.cache?.provider ?? 'in-memory';

	logger.info(`Initializing Cache Module with provider: ${providerId}`);

	let cacheProvider: ICacheProvider;
	if (providerId === 'redis') {
		const redisConnection = container.resolve(ContainerInfraKeys.REDIS_CONNECTION);
		cacheProvider = new RedisCacheProvider({ redisConnection });
	} else {
		cacheProvider = new InMemoryCacheProvider();
	}

	// Register the low-level provider instance
	container.register(ContainerInfraKeys.CACHE_PROVIDER, asValue(cacheProvider));

	// Register the high-level public module that the app will use
	container.register(ContainerInfraKeys.CACHE_MODULE, asClass(CacheModule).singleton());
};
