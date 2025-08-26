import { type EntityManager, wrap } from '@mikro-orm/core';
import { tryCatch } from '@utils/try-catch';
import { serializeError } from 'serialize-error';
import type { FindConfig } from '@/common/find-config';
import { BaseService } from '@/common/services/base-service';
import { isDefined } from '@/core/utils/common/is-defined';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import AppError from '@/lib/exceptions/errors';
import type Category from '@/modules/content/entities/category.entity';
import type CategoryRepository from '@/modules/content/repositories/category.repository';
import { CategoryFilterBuilder } from '@/modules/content/types/category.filter-builder';
import type {
	AddCategoryInput,
	CategoryDTO,
	FilterableCategoryProps,
	UpdateCategoryCommand,
} from '@/modules/content/types/category.types';
import type { AppLogger } from '@/types/common';

type CategoryServiceProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerInfraKeys.DATABASE_EM]: EntityManager;
	[ContainerRepositoriesKeys.CATEGORY]: CategoryRepository;
};

export default class CategoryService extends BaseService<Category> {
	protected readonly logger: AppLogger;
	protected readonly eventBus: AbstractEventBus;
	protected readonly entityManager: EntityManager;
	protected readonly categoryRepository: CategoryRepository;

	constructor({ logger, _database_em, _event_bus, categoryRepository }: CategoryServiceProps) {
		super();
		this.logger = logger;
		this.entityManager = _database_em;
		this.eventBus = _event_bus;
		this.categoryRepository = categoryRepository;
	}

	async list(filter: FilterableCategoryProps = {}, config: FindConfig<Category> = {}): Promise<CategoryDTO[]> {
		const where = CategoryFilterBuilder.build(filter);
		const opts = this.toFindOptions(config);

		const categories = await this.categoryRepository.find(where, opts);

		return categories.map((c) => wrap(c).toJSON());
	}

	async retrieve(categoryId: string, config: FindConfig<Category> = {}): Promise<CategoryDTO | null> {
		if (!isDefined(categoryId)) {
			throw new AppError(AppError.Types.NOT_FOUND, `"categoryId" must be defined`);
		}

		const opts = this.toFindOptions(config);
		const category = await this.categoryRepository.findOne({ id: categoryId }, opts);

		if (!category) {
			return null;
		}

		return wrap(category).toJSON();
	}

	async createEntity(input: AddCategoryInput): Promise<Category> {
		// check the slug
		const slugExists = await this.categoryRepository.findOne({ slug: input.slug }, { fields: ['id'] });
		if (slugExists) {
			throw new AppError(AppError.Types.CONFLICT, `A category with the slug '${input.slug}' already exists`);
		}

		const [error, created] = await tryCatch(async () => {
			return this.categoryRepository.create({
				name: input.name,
				slug: input.slug,
				description: input.description,
				iconUrl: input.iconUrl,
				color: input.color,
				sortOrder: input.sortOrder ?? 0,
				isActive: true,
			});
		});

		if (error) {
			this.logger.error({ error: serializeError(error) }, 'Could not create category entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not create category.');
		}

		return created;
	}

	async create(input: AddCategoryInput): Promise<CategoryDTO> {
		const entity = await this.createEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'category.created',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}

	async updateEntity(input: UpdateCategoryCommand): Promise<Category> {
		const category = await this.categoryRepository.findOne({ id: input.id });

		if (!category) {
			throw new AppError(AppError.Types.NOT_FOUND, `Category with id ${input.id} not found`);
		}

		if (input.slug && input.slug !== category.slug) {
			const categoryExists = await this.categoryRepository.findOne({
				slug: input.slug,
				id: { $ne: input.id },
			});
			if (categoryExists) {
				throw new AppError(AppError.Types.CONFLICT, `A category with the slug '${input.slug}' already exists`);
			}
		}

		const [error, updated] = await tryCatch(async () => {
			const { id, ...data } = input;

			for (const key of Object.keys(data)) {
				data[key] === undefined ? delete data[key] : {};
			}

			wrap(category).assign(data);

			return category;
		});

		if (error) {
			if (error instanceof AppError) {
				throw error;
			}
			this.logger.error({ error: serializeError(error) }, 'Could not update category entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not update category.');
		}

		return updated;
	}

	async update(input: UpdateCategoryCommand): Promise<CategoryDTO> {
		const entity = await this.updateEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'category.updated',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}
}
