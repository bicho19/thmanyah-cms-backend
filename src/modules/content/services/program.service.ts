import { type EntityManager, wrap } from '@mikro-orm/core';
import { tryCatch } from '@utils/try-catch';
import { serializeError } from 'serialize-error';
import type { FindConfig } from '@/common/find-config';
import { BaseService } from '@/common/services/base-service';
import { isDefined } from '@/core/utils/common/is-defined';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import AppError from '@/lib/exceptions/errors';
import type Program from '@/modules/content/entities/program.entity';
import type ProgramRepository from '@/modules/content/repositories/program.repository';
import { ProgramFilterBuilder } from '@/modules/content/types/program.filter-builder';
import type {
	AddProgramCommand,
	FilterableProgramProps,
	ProgramDTO,
	UpdateProgramCommand,
} from '@/modules/content/types/program.types';
import type { AppLogger } from '@/types/common';

type ProgramServiceProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerInfraKeys.DATABASE_EM]: EntityManager;
	[ContainerRepositoriesKeys.PROGRAM]: ProgramRepository;
};

export default class ProgramService extends BaseService<Program> {
	protected readonly logger: AppLogger;
	protected readonly eventBus: AbstractEventBus;
	protected readonly entityManager: EntityManager;
	protected readonly programRepository: ProgramRepository;

	constructor({ logger, _database_em, _event_bus, programRepository }: ProgramServiceProps) {
		super();
		this.logger = logger;
		this.entityManager = _database_em;
		this.eventBus = _event_bus;
		this.programRepository = programRepository;
	}

	async list(filter: FilterableProgramProps = {}, config: FindConfig<Program> = {}): Promise<ProgramDTO[]> {
		const where = ProgramFilterBuilder.build(filter);
		const opts = this.toFindOptions(config);

		const programs = await this.programRepository.find(where, opts);

		return programs.map((p) => wrap(p).toJSON());
	}

	async retrieve(programId: string, config: FindConfig<Program> = {}): Promise<ProgramDTO | null> {
		if (!isDefined(programId)) {
			throw new AppError(AppError.Types.NOT_FOUND, `"programId" must be defined`);
		}

		const opts = this.toFindOptions(config);
		const program = await this.programRepository.findOne({ id: programId }, opts);

		if (!program) {
			return null;
		}

		return wrap(program).toJSON();
	}

	async createEntity(input: AddProgramCommand): Promise<Program> {
		const [error, created] = await tryCatch(async () => {
			return this.programRepository.create({
				title: input.title,
				description: input.description,
				slug: input.slug,
				type: input.type,
				shortDescription: input.shortDescription,
				status: 'draft',
				category: input.categoryId,
				thumbnailUrl: input.thumbnailUrl,
				bannerUrl: input.bannerUrl,
				tags: input.tags,
				publishedAt: null,
				scheduledPublishAt: null,
				averageRating: 0,
				totalEpisodes: 0,
				totalRatings: 0,
				totalViews: 0,
			});
		});

		if (error) {
			this.logger.error({ error: serializeError(error) }, 'Could not create program entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not create program.');
		}

		return created;
	}

	async create(input: AddProgramCommand): Promise<ProgramDTO> {
		const entity = await this.createEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'program.created',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}

	async updateEntity(input: UpdateProgramCommand): Promise<Program> {
		const program = await this.programRepository.findOne({ id: input.id });

		if (!program) {
			throw new AppError(AppError.Types.NOT_FOUND, `Program with id ${input.id} not found`);
		}

		if (input.slug && input.slug !== program.slug) {
			const existing = await this.programRepository.findOne({ slug: input.slug });
			if (existing) {
				throw new AppError(AppError.Types.CONFLICT, `A program with the slug '${input.slug}' already exists`);
			}
		}

		const [error, updated] = await tryCatch(async () => {
			const { id, ...data } = input;

			for (const key of Object.keys(data)) {
				data[key] === undefined ? delete data[key] : {};
			}

			wrap(program).assign(data);

			return program;
		});

		if (error) {
			this.logger.error({ error: serializeError(error) }, 'Could not update program entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not update program.');
		}

		return updated;
	}

	async update(input: UpdateProgramCommand): Promise<ProgramDTO> {
		const entity = await this.updateEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'program.updated',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}
}
