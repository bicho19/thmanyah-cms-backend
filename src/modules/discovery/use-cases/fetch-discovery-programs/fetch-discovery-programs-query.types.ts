import type { ProgramDTO } from '@/modules/content/types/program.types';
import type { PaginatedResponse } from '@/types/response.types';

export type FetchDiscoveryProgramsQuery = {
	page: number;
	limit: number;
	sortBy: 'publishedAt' | 'totalViews' | 'relevance';
	q?: string;
	query?: string;
	category?: string;
	tags?: string[];
};

export type FetchDiscoveryProgramsResponse = PaginatedResponse<ProgramDTO> & {};
