import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type CategoryService from '@/modules/content/services/category.service';
import type ProgramService from '@/modules/content/services/program.service';
import type {
	AddProgramCommand,
	AddProgramResponse,
} from '@/modules/content/use-cases/programs/add-program/add-program.types';

type AddProgramCommandHandlerProps = {
	[ContainerServicesKeys.PROGRAM]: ProgramService;
	[ContainerServicesKeys.CATEGORY]: CategoryService;
};

class AddProgramCommandHandler implements CommandHandler<AddProgramCommand, AddProgramResponse> {
	private readonly programService: ProgramService;
	private readonly categoryService: CategoryService;

	constructor({ programService, categoryService }: AddProgramCommandHandlerProps) {
		this.programService = programService;
		this.categoryService = categoryService;
	}

	async execute(payload: AddProgramCommand): Promise<AddProgramResponse> {
		// Check the category
		const category = await this.categoryService.retrieve(payload.categoryId, { fields: ['id'] });
		if (!category) {
			throw new AppError(AppError.Types.NOT_FOUND, `Category with id ${payload.categoryId} not found`);
		}

		const program = await this.programService.create({
			title: payload.title,
			type: payload.type,
			categoryId: payload.categoryId,
			description: payload.description,
			slug: payload.slug,
			tags: [],
			bannerUrl: payload.bannerUrl,
			shortDescription: payload.shortDescription,
			thumbnailUrl: payload.thumbnailUrl,
		});

		return {
			program,
		};
	}
}

export default AddProgramCommandHandler;
