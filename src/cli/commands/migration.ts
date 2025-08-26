import readline from 'node:readline';
import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Command } from 'commander';
import { createPromptInterface, promptForMigrationName, promptForModule } from '@/cli/utils/prompts';
import { env } from '@/config/env';
import { createMikroOrmConfig } from '@/config/mikro-orm.config';
import { ModularMigrationManager } from '@/lib/migration-manager';

export function createMigrationCommands(): Command {
	const migration = new Command('migration');

	migration
		.command('generate')
		.alias('g')
		.description('Generate a new migration for a module')
		.option('-m, --module <module>', 'Module name')
		.option('-n, --name <name>', 'Migration name')
		.option('-i, --interactive', 'Force interactive mode even if options are provided')
		.action(async (options) => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			try {
				console.log('🚀 Migration Generator\n');

				// Initialize ORM
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				// Create migration manager
				const migrationManager = new ModularMigrationManager(orm);

				let moduleName: string;
				let migrationName: string;

				// Interactive mode or missing options
				if (options.interactive || !options.module || !options.name) {
					console.log("📋 Let's create a new migration...\n");

					moduleName = await getModuleName(options.interactive ? undefined : options.module);
					migrationName = await getMigrationName(options.interactive ? undefined : options.name);

					// Confirmation
					console.log('\n📄 Migration Summary:');
					console.log(`   Module: ${moduleName}`);
					console.log(`   Name: ${migrationName}`);
					console.log(
						`   File: ${new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '')}_${migrationName}.ts`,
					);

					const shouldContinue = await promptForConfirmation('\nProceed with generation?');
					if (!shouldContinue) {
						console.log('❌ Migration generation cancelled');
						return;
					}
				} else {
					moduleName = options.module;
					migrationName = options.name;
				}

				console.log('\n⏳ Generating migration...');

				// Generate migration
				const fileName = await migrationManager.generateModuleMigration(moduleName, migrationName);

				console.log('\n✅ Migration generated successfully!');
				console.log(`   📁 Module: ${moduleName}`);
				console.log(`   📄 File: ${fileName}`);
				console.log(`   📍 Location: ./src/modules/${moduleName}/migrations/${fileName}`);

				console.log('\n💡 Next steps:');
				console.log('   1. Edit the migration file to add your schema changes');
				console.log('   2. Run: npm run cli migration run');
			} catch (error: any) {
				console.error('\n❌ Failed to generate migration:', error.message);
				process.exit(1);
			} finally {
				if (orm) {
					await orm.close();
				}
				process.exit(0);
			}
		});

	migration
		.command('run')
		.description('Run all pending migrations')
		.action(async () => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			try {
				// Initialize ORM
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				// Create migration manager
				const migrationManager = new ModularMigrationManager(orm);

				// Run migrations
				await migrationManager.runMigrations();
				console.log('✓ All migrations completed');
			} catch (error) {
				console.error('✗ Migration failed:', error);
				process.exit(1);
			} finally {
				if (orm) {
					await orm.close();
				}
			}
		});

	migration
		.command('status')
		.description('Show migration status by module')
		.action(async () => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			try {
				// Initialize ORM
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				// Create migration manager
				const migrationManager = new ModularMigrationManager(orm);

				// Get status
				const status = await migrationManager.getMigrationStatusByModule();

				if (Object.keys(status).length === 0) {
					console.log('✓ No migrations found');
				} else {
					console.log('Migration status by module:');
					Object.entries(status).forEach(([module, migrations]) => {
						console.log(`\n  ${module}:`);
						migrations.forEach((migration) => {
							const statusIcon = migration.status === 'executed' ? '✓' : migration.status === 'pending' ? '○' : '?';
							console.log(`    ${statusIcon} ${migration.name} (${migration.status})`);
						});
					});
				}
			} catch (error) {
				console.error('✗ Failed to get migration status:', error);
				process.exit(1);
			} finally {
				if (orm) {
					await orm.close();
				}
			}
		});

	migration
		.command('rollback')
		.description('Rollback the last migration')
		.option('-t, --to <migration>', 'Rollback to specific migration')
		.action(async (options) => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			try {
				// Initialize ORM
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				const migrator = orm.getMigrator();

				if (options.to) {
					await migrator.down({ to: options.to });
					console.log(`✓ Rolled back to migration: ${options.to}`);
				} else {
					await migrator.down();
					console.log('✓ Rolled back last migration');
				}
			} catch (error) {
				console.error('✗ Rollback failed:', error);
				process.exit(1);
			} finally {
				if (orm) {
					await orm.close();
				}
			}
		});

	migration
		.command('fresh')
		.description('Drop all tables and re-run all migrations')
		.option('--force', 'Force fresh migration without confirmation')
		.action(async (options) => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			try {
				if (!options.force) {
					const rl = readline.createInterface({
						input: process.stdin,
						output: process.stdout,
					});

					const answer = await new Promise<string>((resolve) => {
						rl.question('This will drop all tables and data. Are you sure? (y/N): ', resolve);
					});

					rl.close();

					if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
						console.log('Operation cancelled');
						return;
					}
				}

				// Initialize ORM
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				// Drop and recreate schema
				const generator = orm.getSchemaGenerator();
				await generator.dropSchema();
				const migrator = orm.getMigrator();
				await migrator.down({ to: 0 }); // rolls back all
				console.log('✓ Dropped all tables');

				// Create migration manager and run migrations
				const migrationManager = new ModularMigrationManager(orm);
				await migrationManager.runMigrations();
				console.log('✓ Fresh migration completed');
			} catch (error) {
				console.error('✗ Fresh migration failed:', error);
				process.exit(1);
			} finally {
				if (orm) {
					await orm.close();
				}
			}
		});

	return migration;
}

// Helper functions for interactive prompts
async function getModuleName(providedModule?: string): Promise<string> {
	if (providedModule) {
		return providedModule;
	}

	return await promptForModule();
}

async function getMigrationName(providedName?: string): Promise<string> {
	if (providedName) {
		return providedName;
	}

	return await promptForMigrationName();
}

async function promptForConfirmation(message: string): Promise<boolean> {
	const rl = createPromptInterface();

	return new Promise((resolve) => {
		rl.question(`${message} (y/N): `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
		});
	});
}
