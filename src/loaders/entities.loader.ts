import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { EntityManager } from '@mikro-orm/core';
import { getCurrentDirName } from '@utils/current-dir-name';
import { asClass, asFunction, asValue } from 'awilix';
import glob from 'fast-glob';
import { ContainerInfraKeys } from '@/infra/constants';
import { BaseRepository } from '@/types/base-repository';
import type { LoaderOptions } from '@/types/loader';
import { AppBaseEntity } from '@/types/base.entity';

/**
 * Registers models in the modules directory
 */
interface EntityMetadata {
	name: string;
	entity: any;
	repository?: any;
	tableName?: string;
	module: string;
}

export default async ({ container, logger }: LoaderOptions): Promise<void> => {
	const entitiesPath = '../modules/**/entities/*.entity.{ts,js}';
	const repositoriesPath = '../modules/**/repositories/*.repository.{ts,js}';
	const resolvedEntitiesPath = path.join(getCurrentDirName(import.meta.url), entitiesPath);
	const resolvedRepositoriesPath = path.join(getCurrentDirName(import.meta.url), repositoriesPath);

	const em: EntityManager = container.resolve(ContainerInfraKeys.DATABASE_EM);

	// Load entities
	const entityFiles = glob.sync(resolvedEntitiesPath, {
		cwd: getCurrentDirName(import.meta.url),
	});

	const entities: EntityMetadata[] = [];

	logger.debug({ entityFiles }, 'Loading entities');

	for (const file of entityFiles) {
		try {
			const module = await import(pathToFileURL(file).href);
			const entity = module.default ?? module;

			if (entity && isValidEntity(entity)) {
				const entityName = entity.name;
				const moduleName = extractModuleName(file);

				entities.push({
					name: entityName,
					entity,
					module: moduleName,
					tableName: getTableName(entity),
				});

				// Register entity class
				// This will register as: userEntity
				const entityRegistrationName = formatEntityRegistrationName(entityName);
				container.register({
					[entityRegistrationName]: asValue(entity),
				});

				// Register default repository
				const repositoryRegistrationName = formatRepositoryRegistrationName(entityName);

				// makes the repository depend on ‘em’ that exists in the
				// *current* container (request scope)
				container.register({
					[repositoryRegistrationName]: asFunction(
						({ em }) => em.getRepository(entity), // <- uses scoped EM
					).scoped(),
				});

				logger.debug(`Registered entity: ${entityName} from module: ${moduleName}`);
			}
		} catch (err) {
			logger.error({ err, file }, `Could not import entity from ${file}`);
		}
	}

	// Load custom repositories
	await loadCustomRepositories({
		container,
		logger,
		em,
		repositoriesPath: resolvedRepositoriesPath,
		entities,
	});

	// Register entity registry for runtime access
	container.register({
		[ContainerInfraKeys.ENTITY_REGISTRY]: asValue(new Map(entities.map((e) => [e.name, e]))),
	});

	logger.info(`Loaded ${entities.length} entities successfully`);
};

async function loadCustomRepositories({
	container,
	logger,
	em,
	repositoriesPath,
	entities,
}: {
	container: any;
	logger: any;
	em: EntityManager;
	repositoriesPath: string;
	entities: EntityMetadata[];
}) {
	const repositoryFiles = glob.sync(repositoriesPath, {
		cwd: getCurrentDirName(import.meta.url),
	});

	for (const file of repositoryFiles) {
		try {
			const module = await import(pathToFileURL(file).href);
			const repository = module.default ?? module;

			if (repository && isValidRepository(repository)) {
				console.log('Registering valid repo ', repository.name);
				const repositoryName = repository.name;
				const entityName = extractEntityNameFromRepository(repositoryName);

				// Find a corresponding entity
				const entityMetadata = entities.find((e) => e.name === entityName);

				if (entityMetadata) {
					// Register custom repository with DI
					const registrationName = formatRepositoryRegistrationName(entityName);
					container.register({
						[registrationName]: asFunction(
							// ────────────────────────────────────────────────────────────────
							// 1.  get the cradle argument
							// 2.  pull ContainerInfraKeys.DATABASE_EM from it
							// 3.  rename it to local variable `em`
							// ────────────────────────────────────────────────────────────────
							({ [ContainerInfraKeys.DATABASE_EM]: em }) => new repository(em, entityMetadata.entity),
						).scoped(),
					});

					logger.debug(`Registered custom repository: ${repositoryName} with name ${registrationName}`);
				}
			}
		} catch (err) {
			logger.error({ err, file }, `Could not import repository from ${file}`);
		}
	}
}

// Utility functions
function isValidEntity(entity: any): boolean {
	return entity && typeof entity === 'function' && entity.prototype instanceof AppBaseEntity;
}

function isValidRepository(repository: any): boolean {
	return (
		repository &&
		typeof repository === 'function' &&
		repository.name.endsWith('Repository') &&
		repository.prototype instanceof BaseRepository
	);
}

function getTableName(entity: any): string {
	return entity.prototype?.constructor?.tableName || entity.name.toLowerCase() + 's';
}

function extractModuleName(filePath: string): string {
	const parts = filePath.split(path.sep);
	const moduleIndex = parts.findIndex((part) => part === 'modules');
	return moduleIndex !== -1 ? parts[moduleIndex + 1] : 'unknown';
}

function extractEntityNameFromRepository(repositoryName: string): string {
	return repositoryName.replace('Repository', '');
}

function formatEntityRegistrationName(entityName: string): string {
	return lowerFirstChar(entityName);
}

function formatRepositoryRegistrationName(entityName: string): string {
	return `${entityName.replace('Entity', '').toLowerCase()}Repository`;
}

function lowerFirstChar(entity: string): string {
	if (!entity) return entity;
	return entity[0]?.toLowerCase() + entity.slice(1);
}
