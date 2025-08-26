import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, MemoryCacheAdapter } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import glob from 'fast-glob';

type MikroOrmConfig = {
	databaseUri: string;
	appEnv: string;
};

export function createMikroOrmConfig({ databaseUri, appEnv }: MikroOrmConfig) {
	return defineConfig({
		clientUrl: databaseUri,

		// Auto-discover entities
		entities: ['./src/modules/**/entities/*.entity.{ts,js}'],
		entitiesTs: ['./src/modules/**/entities/*.entity.ts'],

		// Metadata provider for better TypeScript support
		metadataProvider: TsMorphMetadataProvider,

		// Extensions
		extensions: [Migrator, EntityGenerator, SeedManager],

		// Use a central migrations directory that will contain all module migrations
		migrations: {
			path: './src/database/migrations',
			pathTs: './src/database/migrations',
			glob: '!(*.d).{js,ts}',
			transactional: true,
			disableForeignKeys: false,
			allOrNothing: true,
			dropTables: false,
			safe: true,
			emit: 'ts',
			fileName: (timestamp: string, name?: string) => {
				return `${timestamp}_${name || 'migration'}`;
			},
		},

		// Seeder settings
		seeder: {
			path: './src/database/seeders',
			pathTs: './src/database/seeders',
			defaultSeeder: 'MainSeeder',
			glob: '!(*.d).{js,ts}',
			emit: 'ts',
		},

		// Connection settings
		pool: {
			min: 2,
			max: 10,
			acquireTimeoutMillis: 60000,
			createTimeoutMillis: 30000,
			destroyTimeoutMillis: 5000,
			idleTimeoutMillis: 30000,
			reapIntervalMillis: 1000,
			createRetryIntervalMillis: 200,
		},

		// Development settings
		debug: appEnv !== 'production',
		logger: appEnv !== 'production' ? console.log : undefined,

		// Schema settings
		schemaGenerator: {
			disableForeignKeys: false,
			createForeignKeyConstraints: true,
			ignoreSchema: [],
		},

		// Cache settings
		resultCache: {
			adapter: MemoryCacheAdapter,
			expiration: 1000,
			options: {},
		},

		// Validation
		validate: true,
		strict: true,
	});
}

function discoverModuleMigrationPaths(): { js: string[]; ts: string[] } {
	const migrationPattern = './src/modules/*/migrations';
	const migrationDirs = glob.sync(migrationPattern);

	return {
		js: migrationDirs,
		ts: migrationDirs,
	};
}
