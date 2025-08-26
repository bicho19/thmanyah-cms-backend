import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type FetchEpisodeQuery = {
	id: string;
};

export type FetchEpisodeResponse = {
	episode: EpisodeDTO | null;
};
