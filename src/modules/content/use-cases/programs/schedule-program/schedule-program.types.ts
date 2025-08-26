import type { ProgramDTO } from '@/modules/content/types/program.types';

export type ScheduleProgramCommand = {
	id: string;
	scheduledPublishAt: Date;
};

export type ScheduleProgramResponse = {
	program: ProgramDTO;
};
