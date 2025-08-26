import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { asValue } from 'awilix';
import { serializeError } from 'serialize-error';
import { createMikroOrmConfig } from '@/config/mikro-orm.config';
import { DatabaseLogger } from '@/database/mikro-orm-logger';
import { ContainerInfraKeys } from '@/infra/constants';
import type { LoaderOptions } from '@/types/loader';

export default async ({ container, configModule, logger }: LoaderOptions): Promise<void> => {
	try {
		// Check if ORM is already initialized
		const existingOrm = container.hasRegistration(ContainerInfraKeys.DATABASE_ORM);
		if (existingOrm) {
			logger.info('Database ORM already initialized. Skipping new connection.');
			return;
		}

		logger.info('Connecting to PostgreSQL database...');

		// Create MikroORM configuration
		const config = createMikroOrmConfig({
			databaseUri: configModule.baseConfig.database_uri,
			appEnv: configModule.baseConfig.app_env,
		});

		// Initialize MikroORM
		const orm = await MikroORM.init<PostgreSqlDriver>({
			...config,
			debug: ['query', 'info'],
			loggerFactory: (options) => new DatabaseLogger(options),
		});

		logger.info('Database connection successful.');

		// Register core database services
		container.register({
			[ContainerInfraKeys.DATABASE_ORM]: asValue(orm),
			[ContainerInfraKeys.DATABASE_EM]: asValue(orm.em),
			[ContainerInfraKeys.DATABASE_CONNECTION]: asValue(orm.em.getConnection()),
		});

		// Register entity manager factory for request-scoped EMs
		container.register({
			[ContainerInfraKeys.DATABASE_EM_FACTORY]: asValue(() => orm.em.fork()),
		});
	} catch (error) {
		logger.error({ error: serializeError(error) }, 'Failed to connect to the database.');
		process.exit(1);
	}
};
