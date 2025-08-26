import { asClass, asValue } from 'awilix';
import type Redis from 'ioredis';
import { ContainerInfraKeys } from '@/infra/constants';
import LocalEventBus from '@/infra/event-bus/in-memory';
import RedisEventBus from '@/infra/event-bus/redis/redis-event-bus';
import type { LoaderOptions } from '@/types/loader';

export default async ({ container, configModule, logger }: LoaderOptions): Promise<void> => {
	logger.info(' ----- Initializing event bus -----');

	// Read the provider from your application configuration
	// This makes the choice explicit and easy to change without touching code.
	const eventBusProvider = configModule.eventBus.provider ?? 'in-memory';

	logger.info(`Initializing Event Bus with provider: ${eventBusProvider}`);

	if (eventBusProvider === 'redis') {
		// --- Redis Event Bus Registration ---

		// Awilix can't auto-resolve __redis_event_bus_connection__ if it's named like that.
		// It's better to resolve dependencies manually here for clarity.
		const redisConnection = container.resolve<Redis>(ContainerInfraKeys.REDIS_CONNECTION);

		const redisEventBus = new RedisEventBus(
			{
				logger,
				// Pass the resolved connection with the expected key
				[ContainerInfraKeys.REDIS_CONNECTION]: redisConnection,
			},
			// Pass module options from your config
			{},
		);

		// Register the already instantiated service as a value.
		// This is the correct way when you manually create the instance.
		container.register(ContainerInfraKeys.EVENT_BUS, asValue(redisEventBus));
		logger.info('Redis Event Bus initialized.');
	} else {
		// --- In-Memory (Local) Event Bus Registration ---

		// For the simple in-memory service, we can let Awilix build it.
		// It will automatically inject the 'logger'.

		container.register(ContainerInfraKeys.EVENT_BUS, asClass(LocalEventBus).singleton());
		logger.info('In-memory Event Bus initialized.');
	}
};
