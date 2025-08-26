import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type UnpublishEpisodeCommand = {
	id: string;
};

export type UnpublishEpisodeResponse = {
	episode: EpisodeDTO;
};
