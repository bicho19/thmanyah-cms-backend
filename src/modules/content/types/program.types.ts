import type { EntityDTO } from '@mikro-orm/core';
import type Program from '@/modules/content/entities/program.entity';
import type { ProgramStatus, ProgramType } from '@/modules/content/entities/program.entity';

export type ProgramDTO = EntityDTO<Program>;

export type FilterableProgramProps = {
	id?: string | string[];
	title?: string;
	type?: ProgramType;
	status?: ProgramStatus;
	slug?: string;
	categoryId?: string;
};

export type AddProgramCommand = {
	title: string;
	description: string;
	slug: string;
	type: ProgramType;
	tags: string[];
	categoryId: string;
	shortDescription?: string | null;
	thumbnailUrl?: string | null;
	bannerUrl?: string | null;
};

export type UpdateProgramCommand = {
	id: string;
	title?: string | null;
	description?: string | null;
	slug?: string | null;
	type?: ProgramType | null;
	status?: ProgramStatus | null;
	shortDescription?: string | null;
	categoryId?: string | null;
	thumbnailUrl?: string | null;
	bannerUrl?: string | null;
	publishedAt?: Date | null;
	scheduledPublishAt?: Date | null;
};
