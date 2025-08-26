import type { ProgramDTO } from '@/modules/content/types/program.types';

export type UnpublishProgramCommand = {
	id: string;
};

export type UnpublishProgramResponse = {
	program: ProgramDTO;
};
