import type { ProgramDTO } from '@/modules/content/types/program.types';

export type PublishProgramCommand = {
	id: string;
};

export type PublishProgramResponse = {
	program: ProgramDTO;
};
