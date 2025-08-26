import type { ProgramDTO } from '@/modules/content/types/program.types';

export type UpdateProgramCommand = {
	id: string;
	title?: string | null;
	description?: string | null;
	slug?: string | null;
	type?: string | null;
	shortDescription?: string | null;
	categoryId?: string | null;
	thumbnailUrl?: string | null;
	bannerUrl?: string | null;
};

export type UpdateProgramResponse = {
	program: ProgramDTO;
};
