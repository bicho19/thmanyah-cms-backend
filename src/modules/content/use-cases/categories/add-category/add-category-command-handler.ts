import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type CategoryService from '@/modules/content/services/category.service';
import type {
	AddCategoryCommand,
	AddCategoryResponse,
} from '@/modules/content/use-cases/categories/add-category/add-category.types';

type AddCategoryCommandHandlerProps = {
	[ContainerServicesKeys.CATEGORY]: CategoryService;
};

class AddCategoryCommandHandler implements CommandHandler<AddCategoryCommand, AddCategoryResponse> {
	private readonly categoryService: CategoryService;

	constructor({ categoryService }: AddCategoryCommandHandlerProps) {
		this.categoryService = categoryService;
	}

	async execute(payload: AddCategoryCommand): Promise<AddCategoryResponse> {
		const category = await this.categoryService.create({
			name: payload.name,
			slug: payload.slug,
			description: payload.description,
			color: payload.color,
			sortOrder: payload.sortOrder,
			iconUrl: payload.iconUrl,
		});

		return {
			category,
		};
	}
}
export default AddCategoryCommandHandler;
