import { Collection, Entity, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';
import Media, { type MediaType } from '@/modules/content/entities/media.entity';
import Program from '@/modules/content/entities/program.entity';
import { AppBaseEntity } from '@/types/base.entity';

export type EpisodeStatus = 'draft' | 'scheduled' | 'published' | 'unpublished' | 'archived' | 'deleted';

@Entity({ tableName: 'episodes' })
@Unique({ properties: ['sourceProvider', 'sourceId'] })
export default class Episode extends AppBaseEntity {
	@Property()
	title: string;

	@Property({ type: 'text' })
	description: string;

	@Property({ type: 'text', nullable: true })
	shortDescription?: string;

	@ManyToOne(() => Program)
	program: Program;

	@Property()
	episodeNumber: number;

	@Property({ nullable: true })
	seasonNumber?: number;

	// Duration in seconds
	@Property()
	durationSeconds: number;

	@Property()
	status: EpisodeStatus = 'draft';

	@Property({ unique: true })
	slug: string;

	@Property({ type: 'text[]' })
	tags: string[] = [];

	@Property()
	publishDate?: Date | null = null;

	@Property({ nullable: true })
	scheduledPublishAt?: Date | null = null;

	@Property({ type: 'text[]' })
	showNotes: string[] = [];

	@Property({ nullable: true })
	thumbnailUrl?: string;

	// Denormalized primary media type for quick filtering and UI rendering.
	@Property({ nullable: true })
	primaryMediaType?: MediaType;

	// The collection of all media files associated with this episode.
	@OneToMany(
		() => Media,
		(media) => media.episode,
		{ orphanRemoval: true },
	)
	mediaFiles = new Collection<Media>(this);

	// e.g., 'youtube', 'spotify', 'internal_cms'
	@Property({ nullable: true, index: true })
	sourceProvider?: string;

	// The unique ID of the content on the original platform
	@Property({ nullable: true, index: true })
	sourceId?: string;

	// Analytics
	@Property({ default: 0 })
	viewCount: number = 0;

	@Property({ default: 0 })
	likeCount: number = 0;

	@Property({ default: 0 })
	shareCount: number = 0;

	@Property({ type: 'decimal', precision: 3, scale: 2, default: 0 })
	rating: number = 0;

	@Property({ default: 0 })
	ratingCount: number = 0;
}
