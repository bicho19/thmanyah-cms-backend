import { EOL } from 'node:os';
import { asValue } from 'awilix';
import Redis from 'ioredis';
import { ContainerInfraKeys } from '@/infra/constants';
import type { LoaderOptions } from '@/types/loader';

async function redisLoader({
	container,
	configModule,
	logger,
}: LoaderOptions): Promise<{ shutdown: () => Promise<void> }> {
	let client: Redis;

	logger.info('Initializing Redis connection');

	if (!configModule.baseConfig.redis.uri) {
		throw new Error('No Redis url was provided');
	}

	client = new Redis(configModule.baseConfig.redis.uri, {
		maxRetriesPerRequest: null,
		lazyConnect: true,
		...(configModule.baseConfig.redis.options ?? {}),
	});

	try {
		await client.connect();
		logger.info('Connection to Redis established');
	} catch (err) {
		logger.error(`An error occurred while connecting to Redis:${EOL} ${err}`);
	}

	container.register({
		[ContainerInfraKeys.REDIS_CONNECTION]: asValue(client),
	});

	return {
		shutdown: async () => {
			client.disconnect();
		},
	};
}

export default redisLoader;
