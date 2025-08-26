export type SearchProgramsInput = {
	q?: string;
	query?: string;
	category?: string;
	tags?: string[];
	sortBy: 'publishedAt' | 'totalViews' | 'relevance';
	page: number;
	limit: number;
};

export type SearchProgramEpisodesInput = {
	programSlug: string;
	page: number;
	limit: number;
};
