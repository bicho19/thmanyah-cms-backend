import type { ProgramDTO } from '@/modules/content/types/program.types';

export type FetchProgramQuery = {
	id: string;
};

export type FetchProgramResponse = {
	program: ProgramDTO;
};
