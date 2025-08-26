import type { EpisodeDTO } from '@/modules/content/types/episode.types';

export type AddEpisodeCommand = {
	title: string;
	description: string;
	slug: string;
	programId: string;
	episodeNumber: number;
	durationSeconds: number;
	shortDescription?: string | null;
	seasonNumber?: number | null;
	thumbnailUrl?: string | null;
	tags?: string[] | null;
	showNotes?: string[] | null;
};

export type AddEpisodeResponse = {
	episode: EpisodeDTO;
};
