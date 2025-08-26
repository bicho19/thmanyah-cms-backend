import { type EntityManager, EntityRepository, type FilterQuery, type FindOptions } from '@mikro-orm/core';
import type { AppBaseEntity } from '@/types/base.entity';

export abstract class BaseRepository<T extends AppBaseEntity> extends EntityRepository<T> {
	constructor(
		protected readonly em: EntityManager,
		protected readonly entityClass: new () => T,
	) {
		super(em, entityClass);
	}

	async findByIdOrFail(id: string, options?: FindOptions<T>): Promise<T> {
		const entity = await this.findOne({ id } as FilterQuery<T>, options);
		if (!entity) {
			throw new Error(`${this.entityName} with id ${id} not found`);
		}
		return entity;
	}

	async findManyByIds(ids: string[], options?: FindOptions<T>): Promise<T[]> {
		return this.find({ id: { $in: ids } } as FilterQuery<T>, options);
	}

	async exists(where: FilterQuery<T>): Promise<boolean> {
		return (await this.count(where)) > 0;
	}

	async existsById(id: string): Promise<boolean> {
		const count = await this.count({ id } as FilterQuery<T>);
		return count > 0;
	}

	async softDelete(id: string): Promise<void> {
		await this.nativeUpdate(
			{ id } as FilterQuery<T>,
			{
				deleted_at: new Date(),
			} as any,
		);
	}

	async createAndSave(data: Partial<T>): Promise<T> {
		const entity = this.create(data);
		await this.em.persistAndFlush(entity);
		return entity;
	}

	async updateAndSave(id: string, data: Partial<T>): Promise<T> {
		const entity = await this.findByIdOrFail(id);
		this.assign(entity, data);
		await this.em.persistAndFlush(entity);
		return entity;
	}
}
