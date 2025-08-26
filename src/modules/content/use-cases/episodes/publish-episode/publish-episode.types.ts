import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type PublishEpisodeCommand = {
	id: string;
};

export type PublishEpisodeResponse = {
	episode: EpisodeDTO;
};
