import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type UpdateEpisodeCommand = {
	id: string;
	title?: string | null;
	description?: string | null;
	slug?: string | null;
	programId?: string | null;
	episodeNumber?: number | null;
	durationSeconds?: number | null;
	tags?: string[] | null;
	showNotes?: string[] | null;
	shortDescription?: string | null;
	seasonNumber?: number | null;
	thumbnailUrl?: string | null;
};

export type UpdateEpisodeResponse = {
	episode: EpisodeDTO;
};
