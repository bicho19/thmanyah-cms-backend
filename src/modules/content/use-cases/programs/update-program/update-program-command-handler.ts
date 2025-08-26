import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type { ProgramType } from '@/modules/content/entities/program.entity';
import type CategoryService from '@/modules/content/services/category.service';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	UpdateProgramCommand,
	UpdateProgramResponse,
} from '@/modules/content/use-cases/programs/update-program/update-program.types';

type UpdateProgramCommandHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
	[ContainerServicesKeys.CATEGORY]: CategoryService;
};

class UpdateProgramCommandHandler implements CommandHandler<UpdateProgramCommand, UpdateProgramResponse> {
	private readonly programService: ProgramService;
	private readonly categoryService: CategoryService;

	constructor({ programService }: UpdateProgramCommandHandlerProps) {
		this.programService = programService;
	}

	async execute(payload: UpdateProgramCommand): Promise<UpdateProgramResponse> {
		// check if category exists
		if (payload.categoryId) {
			const category = await this.categoryService.retrieve(payload.categoryId, { fields: ['id'] });
			if (!category) {
				throw new Error(`Category with id ${payload.categoryId} not found`);
			}
		}

		const program = await this.programService.update({
			id: payload.id,
			title: payload.title,
			description: payload.description,
			shortDescription: payload.shortDescription,
			categoryId: payload.categoryId,
			slug: payload.slug,
			type: payload.type as ProgramType,
			thumbnailUrl: payload.thumbnailUrl,
			bannerUrl: payload.bannerUrl,
		});

		return {
			program,
		};
	}
}

export default UpdateProgramCommandHandler;
