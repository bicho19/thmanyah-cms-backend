import type { ProgramType } from '@/modules/content/entities/program.entity';
import type { ProgramDTO } from '@/modules/content/types/program.types';

export type AddProgramCommand = {
	title: string;
	description: string;
	slug: string;
	type: ProgramType;
	categoryId: string;
	shortDescription?: string | null;
	thumbnailUrl?: string | null;
	bannerUrl?: string | null;
};

export type AddProgramResponse = {
	program: ProgramDTO;
};
