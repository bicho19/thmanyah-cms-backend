import type { ProgramStatus, ProgramType } from '@/modules/content/entities/program.entity';
import type { ProgramDTO } from '@/modules/content/types/program.types';

export type FetchProgramsQuery = {
	title?: string | null;
	type?: ProgramType | null;
	status?: ProgramStatus | null;
	slug?: string | null;
	categoryId?: string | null;
};

export type FetchProgramsResponse = {
	programs: ProgramDTO[];
};
