import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { AppBaseEntity } from '@/types/base.entity';
import Episode from './episode.entity';

export type MediaType = 'video' | 'audio';

export type MediaSource = 'upload' | 'youtube' | 'spotify' | 'external';

@Entity({ tableName: 'episode_medias' })
export default class Media extends AppBaseEntity {
	@ManyToOne(() => Episode)
	episode: Episode;

	@Property()
	type: MediaType;

	// The direct URL to the media file (cdn.thmanyah.com/episode-34/file.mp4) or stream manifest (e.g., cdn.thmanyah.com/episode-34/playlist.m3u8)
	@Property({ type: 'text' })
	url: string;

	@Property()
	source: MediaSource;

	// 'video/mp4', 'audio/mpeg',
	@Property({ nullable: true })
	mimeType?: string;

	// A user-friendly label, e.g., '1080p', '720p', '128kbps Audio'
	@Property({ nullable: true })
	qualityLabel?: string;

	@Property({ type: 'bigint', nullable: true })
	fileSizeBytes?: number;

	// To control the order if an episode has multiple files (e.g., video first)
	@Property({ default: 0 })
	sortOrder: number = 0;
}
