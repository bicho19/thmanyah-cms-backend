import type { EntityManager } from '@mikro-orm/core';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import Episode from '@/modules/content/entities/episode.entity';
import Media from '@/modules/content/entities/media.entity';
import Program from '@/modules/content/entities/program.entity';
import type EpisodeRepository from '@/modules/content/repositories/episode.repository';
import type ProgramRepository from '@/modules/content/repositories/program.repository';
import type { IImporter } from '@/modules/importer/interfaces/mporter.interface';
import type { AppLogger } from '@/types/common';

type ImportServiceProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerInfraKeys.DATABASE_EM]: EntityManager;
	[ContainerRepositoriesKeys.PROGRAM]: ProgramRepository;
	[ContainerRepositoriesKeys.EPISODE]: EpisodeRepository;
	importers: IImporter[];
};

export default class ImportService {
	protected readonly logger: AppLogger;
	protected readonly eventBus: AbstractEventBus;
	protected readonly entityManager: EntityManager;
	protected readonly programRepository: ProgramRepository;
	protected readonly episodeRepository: EpisodeRepository;
	private readonly importers: IImporter[];

	constructor({
		logger,
		_database_em,
		_event_bus,
		programRepository,
		episodeRepository,
		importers,
	}: ImportServiceProps) {
		this.logger = logger;
		this.eventBus = _event_bus;
		this.entityManager = _database_em;
		this.programRepository = programRepository;
		this.episodeRepository = episodeRepository;
		this.importers = importers;
	}

	private findImporter(url: string): IImporter {
		this.logger.debug(`Searching for an importer for URL: ${url}`);
		const importer = this.importers.find((imp) => imp.canHandle(url));
		if (!importer) {
			this.logger.error(`No importer found for URL: ${url}`);
			throw new Error('Unsupported URL: No importer found for the provided source.');
		}
		this.logger.info(`Using importer: "${importer.providerName}"`);
		return importer;
	}

	// public async importProgram(url: string): Promise<Program> {
	// 	const importer = this.findImporter(url);
	//
	// 	this.logger.info(`Fetching and mapping data from source: ${importer.providerName}`);
	// 	const data = await importer.fetchAndMap(url);
	// 	this.logger.debug(`Successfully mapped ${data.episodes.length} episodes for program: ${data.title}`);
	//
	// 	const existingProgram = await this.programRepository.findOne({
	// 		sourceProvider: data.sourceProvider,
	// 		sourceId: data.sourceId,
	// 	});
	//
	// 	if (existingProgram) {
	// 		this.logger.warn(`Program "${data.title}" already exists. Update logic not yet implemented.`);
	// 		// In the future, you could call an `updateExistingProgram` method here.
	// 		// For now, we'll just return the existing program.
	// 		return existingProgram;
	// 	}
	//
	// 	this.logger.info(`Creating new program in database: "${data.title}"`);
	// 	const program = await this.entityManager.transactional(async (em) => {
	// 		const programRepo = em.getRepository(Program);
	//
	// 		const newProgram = programRepo.create({
	// 			title: data.title,
	// 			description: data.description,
	// 			sourceProvider: data.sourceProvider,
	// 			sourceId: data.sourceId,
	// 			thumbnailUrl: data.thumbnailUrl,
	// 			status: 'draft',
	// 		});
	//
	// 		// Bulk create episodes for better performance
	// 		for (const epData of data.episodes) {
	// 			const episode = em.create(Episode, {
	// 				program: newProgram,
	// 				title: epData.title,
	// 				description: epData.description,
	// 				publishDate: epData.publishDate,
	// 				durationSeconds: epData.durationSeconds,
	// 				thumbnailUrl: epData.thumbnailUrl,
	// 				status: 'draft',
	// 				primaryMediaType: epData.media[0]?.type,
	// 			});
	//
	// 			for (const mediaData of epData.media) {
	// 				em.create(Media, { episode, ...mediaData });
	// 			}
	// 		}
	//
	// 		return newProgram;
	// 	});
	//
	// 	this.logger.info(`Successfully saved program with ID: ${program.id}`);
	//
	// 	// Dispatch an event to notify other parts of the system
	// 	this.eventBus.dispatch(new ProgramImportedEvent({ programId: program.id }));
	//
	// 	return program;
	// }
}
