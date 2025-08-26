import { Cascade, Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import Category from '@/modules/content/entities/category.entity';
import Episode from '@/modules/content/entities/episode.entity';
import { AppBaseEntity } from '@/types/base.entity';

export type ProgramType = 'podcast' | 'documentary' | 'interview';

export type ProgramStatus = 'draft' | 'scheduled' | 'published' | 'unpublished' | 'archived' | 'deleted';

@Entity({ tableName: 'programs' })
export default class Program extends AppBaseEntity {
	@Property()
	title: string;

	@Property({ type: 'text' })
	description: string;

	@Property({ type: 'text', nullable: true })
	shortDescription?: string;

	@Property()
	type: ProgramType;

	@Property()
	status: ProgramStatus = 'draft';

	@ManyToOne(() => Category, {})
	category: Category;

	@Property({ type: 'text[]' })
	tags: string[] = [];

	@Property({ unique: true })
	slug: string;

	@Property({ nullable: true })
	thumbnailUrl?: string;

	@Property({ nullable: true })
	bannerUrl?: string;

	@OneToMany(
		() => Episode,
		(episode) => episode.program,
		{ cascade: [Cascade.ALL] },
	)
	episodes = new Collection<Episode>(this);

	// Analytics and Metrics
	@Property({ default: 0 })
	totalEpisodes: number = 0;

	@Property({ default: 0 })
	totalViews: number = 0;

	@Property({ type: 'decimal', precision: 3, scale: 2, default: 0 })
	averageRating: number = 0;

	@Property({ default: 0 })
	totalRatings: number = 0;

	// Publication Management
	@Property({ nullable: true })
	publishedAt?: Date;

	@Property({ nullable: true })
	scheduledPublishAt?: Date;
}
