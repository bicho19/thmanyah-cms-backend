import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import Program from '@/modules/content/entities/program.entity';
import { AppBaseEntity } from '@/types/base.entity';

@Entity({ tableName: 'categories' })
export default class Category extends AppBaseEntity {
	@Property()
	name: string;

	@Property({ unique: true })
	slug: string;

	@Property({ type: 'text', nullable: true })
	description?: string;

	@Property({ nullable: true })
	iconUrl?: string;

	@Property({ nullable: true })
	color?: string; // Hex color for UI

	// Content relations
	@OneToMany(
		() => Program,
		(program) => program.category,
	)
	programs = new Collection<Program>(this);

	// Ordering and visibility
	@Property({ default: 0 })
	sortOrder: number = 0;

	@Property({ default: true })
	isActive: boolean = true;
}
