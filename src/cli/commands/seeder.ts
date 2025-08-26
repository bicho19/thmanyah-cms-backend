import { MikroORM } from '@mikro-orm/core';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Command } from 'commander';
import { env } from '@/config/env';
import { createMikroOrmConfig } from '@/config/mikro-orm.config';

// Main function to create the 'seed' command and its subcommands
export function createSeederCommands(): Command {
	// Create the top-level 'seed' command
	const seeder = new Command('seed');

	seeder
		.command('run')
		.description('Run database seeders')
		.option('-c, --class <className>', 'Run a specific seeder class')
		.action(async (options) => {
			let orm: MikroORM<PostgreSqlDriver> | null = null;

			// This pattern is consistent with your migration commands
			const connectAndRun = async () => {
				const ormConfig = createMikroOrmConfig({
					databaseUri: env?.DATABASE_URI,
					appEnv: env?.APP_ENV,
				});
				orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);

				const seeder = orm.getSeeder();

				if (options.class) {
					// Run a specific seeder
					console.log(`\n🌱 Running specific seeder: ${options.class}...`);
					await seeder.seed(options.class);
					console.log(`\n✅ Seeder '${options.class}' executed successfully.`);
				} else {
					// Run the default (main) seeder which calls the rest
					console.log('\n🌱 Running main database seeder...');
					await seeder.seedString('MainSeeder');
					console.log('\n✅ All seeders executed successfully.');
				}
			};

			try {
				await connectAndRun();
			} catch (error: any) {
				console.error('\n❌ Seeding failed:', error.message);
				process.exit(1);
			} finally {
				if (orm) {
					await orm?.close();
				}
				process.exit(0);
			}
		});

	return seeder;
}
