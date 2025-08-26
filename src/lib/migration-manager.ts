import fs from 'node:fs/promises';
import path from 'node:path';
import type { MikroORM } from '@mikro-orm/core';
import glob from 'fast-glob';

export class ModularMigrationManager {
	private readonly centralMigrationsPath = './src/database/migrations';

	constructor(private orm: MikroORM) {}

	/**
	 * Discover all module migration files and copy them to central location
	 */
	async syncModuleMigrations(): Promise<void> {
		const migrationPattern = './src/modules/*/migrations/*.{ts,js}';
		const migrationFiles = glob.sync(migrationPattern);

		// Ensure central migrations directory exists
		await fs.mkdir(this.centralMigrationsPath, { recursive: true });

		// Clear existing module migrations from central location
		await this.clearModuleMigrationsFromCentral();

		const copiedFiles: string[] = [];

		for (const file of migrationFiles) {
			const moduleName = this.extractModuleName(file);
			const originalFileName = path.basename(file); // [FIX] Get the full, original filename

			// [FIX] The new filename should simply be the original filename.
			// The timestamp is already there and guarantees correct ordering.
			// We can add a module prefix to the *name part only* if desired for clarity in the central folder.
			const newFileName = this.createCentralFileName(originalFileName, moduleName);

			const destPath = path.join(this.centralMigrationsPath, newFileName);

			// Copy file content and modify if needed
			const content = await fs.readFile(file, 'utf-8');
			const modifiedContent = this.addModuleComment(content, moduleName);

			await fs.writeFile(destPath, modifiedContent);
			copiedFiles.push(newFileName);
		}

		if (copiedFiles.length > 0) {
			console.log(`Synced ${copiedFiles.length} module migrations to central location`);
		}
	}

	/**
	 * Generate migration for specific module
	 */
	async generateModuleMigration(moduleName: string, migrationName: string): Promise<string> {
		const modulePath = `./src/modules/${moduleName}/migrations`;

		// Ensure migration directory exists
		await fs.mkdir(modulePath, { recursive: true });

		// Check if module exists
		const moduleEntityPath = `./src/modules/${moduleName}/entities`;
		try {
			await fs.access(moduleEntityPath);
		} catch {
			throw new Error(`Module '${moduleName}' does not exist. Please create the module first.`);
		}

		// Generate timestamp
		const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');

		const fileName = `${timestamp}_${migrationName}.ts`;
		const filePath = path.join(modulePath, fileName);

		// Create migration template
		const migrationTemplate = this.createMigrationTemplate(moduleName, migrationName);

		await fs.writeFile(filePath, migrationTemplate);

		console.log(`Generated migration: ${fileName} for module: ${moduleName}`);
		console.log(`Location: ${filePath}`);

		// Sync to central location
		await this.syncModuleMigrations();

		return fileName;
	}

	/**
	 * Run all migrations (from central location)
	 */
	async runMigrations(): Promise<void> {
		console.log('Syncing module migrations...');
		await this.syncModuleMigrations();

		const migrator = this.orm.getMigrator();
		const pendingMigrations = await migrator.getPendingMigrations();

		if (pendingMigrations.length === 0) {
			console.log('No pending migrations found');
			return;
		}

		console.log(`Running ${pendingMigrations.length} pending migrations...`);
		await migrator.up();
		console.log('All migrations executed successfully');
	}

	/**
	 * Get pending migrations
	 */
	async getPendingMigrations(): Promise<string[]> {
		await this.syncModuleMigrations();

		const migrator = this.orm.getMigrator();
		const pending = await migrator.getPendingMigrations();
		return pending.map((m) => m.name);
	}

	/**
	 * Get migration status by module
	 */
	async getMigrationStatusByModule(): Promise<Record<string, MigrationStatus[]>> {
		await this.syncModuleMigrations(); // [FIX] Sync first to get the latest state

		const migrator = this.orm.getMigrator();
		const executedMigrations = await migrator.getExecutedMigrations();
		const allFilesInCentralDir = await this.getAllCentralMigrationNames();

		const statusByModule: Record<string, MigrationStatus[]> = {};

		// [FIX] We should iterate over the module files, as that's our source of truth
		const migrationPattern = './src/modules/*/migrations/*.{ts,js}';
		const moduleMigrationFiles = glob.sync(migrationPattern);

		for (const file of moduleMigrationFiles) {
			const moduleName = this.extractModuleName(file);
			const originalFileName = path.basename(file);
			const baseNameWithoutExt = path.basename(originalFileName, path.extname(originalFileName));
			const timestamp = this.extractTimestamp(originalFileName);

			if (!statusByModule[moduleName]) {
				statusByModule[moduleName] = [];
			}

			const centralFileName = this.createCentralFileName(originalFileName, moduleName);
			const centralBaseName = path.basename(centralFileName, path.extname(centralFileName));

			const isExecuted = executedMigrations.some((m) => m.name === centralBaseName);
			// A migration is pending if it's in the central directory but not executed.
			const isPending = allFilesInCentralDir.includes(centralBaseName) && !isExecuted;

			statusByModule[moduleName].push({
				name: baseNameWithoutExt, // Show the original name
				status: isExecuted ? 'executed' : isPending ? 'pending' : 'not-synced',
				timestamp,
			});
		}

		// Sort by timestamp within each module
		Object.values(statusByModule).forEach((migrations) => {
			migrations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
		});

		return statusByModule;
	}

	// New helper to create the central filename deterministically
	private createCentralFileName(originalFileName: string, moduleName: string): string {
		const timestamp = this.extractTimestamp(originalFileName);
		const namePart = originalFileName.replace(/^\d{14}_/, '');
		// Example: 2024..._my_migration.ts -> 2024..._core_my_migration.ts
		return `${timestamp}_${moduleName}_${namePart}`;
	}

	//  New helper to get all migration names from the central directory
	private async getAllCentralMigrationNames(): Promise<string[]> {
		const centralFiles = glob.sync(path.join(this.centralMigrationsPath, '*.{ts,js}'));
		return centralFiles.map((file) => path.basename(file, path.extname(file)));
	}

	private async clearModuleMigrationsFromCentral(): Promise<void> {
		try {
			const centralFiles = glob.sync(path.join(this.centralMigrationsPath, '*.{ts,js}'));

			for (const file of centralFiles) {
				const content = await fs.readFile(file, 'utf-8');
				if (content.includes('// Module:')) {
					await fs.unlink(file);
				}
			}
		} catch (error) {
			// Ignore
		}
	}

	private extractModuleName(filePath: string): string {
		const parts = filePath.split(path.sep);
		const moduleIndex = parts.findIndex((part) => part === 'modules');
		return moduleIndex !== -1 ? parts[moduleIndex + 1] : 'unknown';
	}

	private extractTimestamp(fileName: string): string {
		const match = fileName.match(/^(\d{14})/);
		if (!match) {
			// This should not happen for valid migration files
			throw new Error(`Could not extract timestamp from invalid migration filename: ${fileName}`);
		}
		return match[1];
	}

	private addModuleComment(content: string, moduleName: string): string {
		return `// Module: ${moduleName}\n${content}`;
	}

	private createMigrationTemplate(moduleName: string, migrationName: string): string {
		const className = this.toPascalCase(`${moduleName}_${migrationName}`);

		return `// Module: ${moduleName}
import { Migration } from '@mikro-orm/migrations';

export class ${className} extends Migration {

  async up(): Promise<void> {
    // Add your migration logic here for ${moduleName} module
    // Example:
    // this.addSql('CREATE TABLE ...');
  }

  async down(): Promise<void> {
    // Add your rollback logic here for ${moduleName} module
    // Example:
    // this.addSql('DROP TABLE ...');
  }

}
`;
	}

	private toPascalCase(str: string): string {
		return str
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
	}
}

interface MigrationStatus {
	name: string;
	status: 'executed' | 'pending' | 'not-synced' | 'unknown';
	timestamp: string;
}
