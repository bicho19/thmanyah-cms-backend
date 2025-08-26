import type { ProgramDTO } from '@/modules/content/types/program.types';

export type FetchProgramDetailsQuery = {
	slug: string;
};

export type FetchProgramDetailsResponse = ProgramDTO;
