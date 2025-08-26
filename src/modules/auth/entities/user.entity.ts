import { Entity, Property } from '@mikro-orm/core';
import { AppBaseEntity } from '@/types/base.entity';

@Entity({ tableName: 'users' })
export default class User extends AppBaseEntity {
	@Property()
	firstName!: string;

	@Property()
	lastName!: string;

	@Property({ unique: true })
	email!: string;

	@Property({ unique: true })
	phone!: string;

	@Property()
	passwordHash!: string;

	@Property({ default: true })
	isActive: boolean = true;

	@Property({ type: 'timestamptz', nullable: true })
	lastLoginAt?: Date;

	@Property({ type: 'timestamptz', nullable: true })
	lastSeenAt?: Date;
}
