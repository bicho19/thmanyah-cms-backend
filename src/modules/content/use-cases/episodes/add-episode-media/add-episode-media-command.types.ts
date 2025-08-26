import type { MediaSource, MediaType } from '@/modules/content/entities/media.entity';
import type { MediaDTO } from '@/modules/content/types/media.types';

export type AddEpisodeMediaCommand = {
	episodeId: string;
	type: MediaType;
	url: string;
	source: MediaSource;
	mimeType?: string;
	qualityLabel?: string;
	fileSizeBytes?: number;
	sortOrder?: number;
};

export type AddEpisodeMediaResponse = MediaDTO;
