import type { EntityDTO } from '@mikro-orm/core';
import type Media from '@/modules/content/entities/media.entity';
import type { MediaSource, MediaType } from '@/modules/content/entities/media.entity';

export type MediaDTO = EntityDTO<Media>;

export type AddEpisodeMediaInput = {
	episodeId: string;
	type: MediaType;
	url: string;
	source: MediaSource;
	mimeType?: string;
	qualityLabel?: string;
	fileSizeBytes?: number;
	sortOrder?: number;
};
