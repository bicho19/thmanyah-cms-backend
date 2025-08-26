import { BaseEntity as MikroBaseEntity, PrimaryKey, Property } from '@mikro-orm/core';
import { ulid } from 'ulid';

export abstract class AppBaseEntity extends MikroBaseEntity {
	@PrimaryKey({ type: 'text' })
	id: string = ulid();

	@Property({ type: 'timestamptz', defaultRaw: 'now()', nullable: false })
	createdAt?: Date = new Date();

	@Property({ type: 'timestamptz', defaultRaw: 'now()', onUpdate: () => new Date(), nullable: false })
	updatedAt?: Date = new Date();
}
