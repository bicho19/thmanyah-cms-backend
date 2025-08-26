import { wrap } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import AppError from '@/lib/exceptions/errors';
import Category from '@/modules/content/entities/category.entity';
import Episode from '@/modules/content/entities/episode.entity';
import Program from '@/modules/content/entities/program.entity';
import type ProgramRepository from '@/modules/content/repositories/program.repository';
import type { CategoryDTO } from '@/modules/content/types/category.types';
import type { EpisodeDTO } from '@/modules/content/types/episode.types';
import type { ProgramDTO } from '@/modules/content/types/program.types';
import type { SearchProgramEpisodesInput, SearchProgramsInput } from '@/modules/discovery/types/discovery.types';
import type { AppLogger } from '@/types/common';
import type { PaginatedResponse } from '@/types/response.types';

type DiscoveryServiceProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerInfraKeys.DATABASE_EM]: EntityManager;
	[ContainerRepositoriesKeys.PROGRAM]: ProgramRepository;
};

export default class DiscoveryService {
	protected readonly logger: AppLogger;
	protected readonly eventBus: AbstractEventBus;
	protected readonly entityManager: EntityManager;
	protected readonly programRepository: ProgramRepository;

	constructor({ logger, _database_em, _event_bus, programRepository }: DiscoveryServiceProps) {
		this.logger = logger;
		this.entityManager = _database_em;
		this.eventBus = _event_bus;
		this.programRepository = programRepository;
	}

	/**
	 * Performs a comprehensive search of categories for public discovery.
	 *
	 *
	 * @returns A paginated response object containing the found programs and metadata.
	 */
	async searchCategories(): Promise<CategoryDTO[]> {
		// INITIALIZE QUERY BUILDER
		const qb = this.entityManager.createQueryBuilder(Category, 'c');

		// The most important filter: only show categories that is marked as 'active'.
		qb.where({ isActive: true });

		// Apply the sort order.
		qb.orderBy({ sortOrder: 'DESC' });

		// EXECUTE AND RETURN
		// Execute the query to get both the results for the current page and the total count of all matching records.
		const results = await qb.getResult();

		// Format the final response object.
		return results.map((c) => wrap(c).toJSON());
	}

	/**
	 * Performs a comprehensive search and filtering of programs for public discovery.
	 *
	 * This method leverages PostgreSQL's Full-Text Search for relevance-based searching
	 * and supports filtering by category and tags, with robust sorting and pagination.
	 *
	 * @param options - The search, filter, sort, and pagination parameters from the client.
	 * @returns A paginated response object containing the found programs and metadata.
	 */
	async searchPrograms(options: SearchProgramsInput): Promise<PaginatedResponse<ProgramDTO>> {
		// INITIALIZE QUERY BUILDER
		// Start by creating a QueryBuilder instance from the EntityManager for the Program entity.
		// We use 'p' as the alias for the program table.
		const qb = this.entityManager.createQueryBuilder(Program, 'p');

		// BASE QUERY AND JOINS
		// Eagerly join and select the category for filtering and to include it in the results.
		qb.leftJoinAndSelect('p.category', 'c');

		// The most important filter: only show content that is marked as 'published'.
		qb.where({ status: 'published' });

		// 3. DYNAMIC FILTERS
		// Apply filters conditionally based on the provided query parameters.

		// Full-Text Search on title, description, and tags
		if (options.q && options.q.trim() !== '') {
			const searchTerm = options.q.trim();
			// Use plainto_tsquery for safe handling of user input and 'arabic' for language support.
			const ftsQuery = `plainto_tsquery('arabic', ?)`;

			// Add a 'relevance' score to the select clause to enable sorting by it.
			qb.addSelect(`ts_rank(p.search_vector, ${ftsQuery}) as relevance`, [searchTerm]);
			// Filter the results where the search_vector matches the query.
			qb.andWhere(`p.search_vector @@ ${ftsQuery}`, [searchTerm]);
		}

		// Filter by category slug
		if (options.category) {
			qb.andWhere({ 'c.slug': options.category });
		}

		// Filter by tags (finds programs that have ALL specified tags)
		if (options.tags && options.tags.length > 0) {
			qb.andWhere({ tags: { $contains: options.tags } });
		}

		// 4. DYNAMIC SORTING
		let sortBy = options.sortBy;
		// If a search term is present, relevance is the most logical default sort order.
		if (options.q) {
			sortBy = 'relevance';
		} else if (sortBy === 'relevance') {
			// If 'relevance' is requested without a search term, fallback to a default.
			sortBy = 'publishedAt';
		}
		// Apply the primary sort order. Also add a secondary sort key to ensure
		// a consistent, deterministic order for items with the same primary score.
		qb.orderBy({ [sortBy as string]: 'DESC', publishedAt: 'DESC' });

		// PAGINATION
		// Apply the limit and calculate the offset for the requested page.
		qb.limit(options.limit).offset((options.page - 1) * options.limit);

		// EXECUTE AND RETURN
		// Execute the query to get both the results for the current page and the total count of all matching records.
		const [results, total] = await qb.getResultAndCount();

		// Format the final response object.
		return {
			items: results.map((p) => wrap(p).toJSON()),
			meta: {
				total,
				page: options.page,
				limit: options.limit,
				totalPages: Math.ceil(total / options.limit),
			},
		};
	}

	/**
	 * Finds a single published program by its slug, including its category.
	 *
	 * @param slug - The slug of the program to find.
	 * @returns A DTO of the found program, or null if not found or not published.
	 */
	async findProgramBySlug(slug: string): Promise<ProgramDTO> {
		const program = await this.programRepository.findOne({ slug, status: 'published' }, { populate: ['category'] });

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, 'Program not found');
		}

		return wrap(program).toJSON();
	}

	async searchProgramEpisodes(query: SearchProgramEpisodesInput): Promise<PaginatedResponse<EpisodeDTO>> {
		const { programSlug, page, limit } = query;

		const program = await this.programRepository.findOne(
			{ slug: programSlug, status: 'published' },
			{ fields: ['id', 'slug'] },
		);

		if (!program) {
			return {
				items: [],
				meta: {
					total: 0,
					page,
					limit,
					totalPages: 0,
				},
			};
		}

		const qb = this.entityManager.createQueryBuilder(Episode, 'e');

		qb.where({
			program: program.id,
			status: 'published',
		});

		qb.orderBy({ publishDate: 'DESC' });

		qb.limit(limit).offset((page - 1) * limit);

		const [results, total] = await qb.getResultAndCount();

		return {
			items: results.map((e) => wrap(e).toJSON()),
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}
