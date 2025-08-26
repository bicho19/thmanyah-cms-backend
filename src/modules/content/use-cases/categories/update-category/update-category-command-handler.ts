import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type CategoryService from '@/modules/content/services/category.service';
import type {
	UpdateCategoryCommand,
	UpdateCategoryResponse,
} from '@/modules/content/use-cases/categories/update-category/update-category.types';

type UpdateCategoryCommandHandlerProps = {
	[ContainerServicesKeys.CATEGORY]: CategoryService;
};

class UpdateCategoryCommandHandler implements CommandHandler<UpdateCategoryCommand, UpdateCategoryResponse> {
	private readonly categoryService: CategoryService;

	constructor({ categoryService }: UpdateCategoryCommandHandlerProps) {
		this.categoryService = categoryService;
	}

	async execute(payload: UpdateCategoryCommand): Promise<UpdateCategoryResponse> {
		const category = await this.categoryService.update(payload);

		return {
			category,
		};
	}
}
export default UpdateCategoryCommandHandler;
