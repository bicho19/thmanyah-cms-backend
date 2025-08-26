import type { EntityDTO } from '@mikro-orm/core';
import type Episode from '@/modules/content/entities/episode.entity';
import type { EpisodeStatus } from '@/modules/content/entities/episode.entity';

export type EpisodeDTO = EntityDTO<Episode>;

export type FilterableEpisodeProps = {
	id?: string | string[];
	title?: string | null;
	status?: EpisodeStatus | null;
	slug?: string | null;
	programId?: string | null;
};

export type AddEpisodeInput = {
	title: string;
	description: string;
	slug: string;
	programId: string;
	episodeNumber: number;
	duration: number;
	tags: string[];
	showNotes: string[];
	shortDescription?: string;
	seasonNumber?: number;
	thumbnailUrl?: string;
};

export type UpdateEpisodeCommand = {
	id: string;
	title?: string;
	description?: string;
	slug?: string;
	programId?: string;
	episodeNumber?: number;
	duration?: number;
	tags?: string[];
	showNotes?: string[];
	shortDescription?: string;
	seasonNumber?: number;
	thumbnailUrl?: string;
	status?: EpisodeStatus;
	publishDate?: Date | null;
	scheduledPublishAt?: Date;
};
