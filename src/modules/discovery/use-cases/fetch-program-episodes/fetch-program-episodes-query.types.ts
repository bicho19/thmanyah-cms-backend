import type { EpisodeDTO } from '@/modules/content/types/episode.types';
import type { PaginatedResponse } from '@/types/response.types';

export type FetchProgramEpisodesQuery = {
	programSlug: string;
	page: number;
	limit: number;
};

export type FetchProgramEpisodesResponse = PaginatedResponse<EpisodeDTO>;
