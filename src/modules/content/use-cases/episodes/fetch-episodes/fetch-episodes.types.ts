import type { EpisodeStatus } from '@/modules/content/entities/episode.entity';
import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type FetchEpisodesQuery = {
	title?: string | null;
	status?: EpisodeStatus | null;
	slug?: string | null;
	programId?: string | null;
};

export type FetchEpisodesResponse = {
	episodes: EpisodeDTO[];
};
