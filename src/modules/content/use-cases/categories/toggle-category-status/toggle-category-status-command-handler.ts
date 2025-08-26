import type { ICacheModule } from '@/infra/cache/cache.types';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import AppError from '@/lib/exceptions/errors';
import type CategoryService from '@/modules/content/services/category.service';
import type {
	ToggleCategoryStatusCommand,
	ToggleCategoryStatusResponse,
} from '@/modules/content/use-cases/categories/toggle-category-status/toggle-category-status.types';

type ToggleCategoryStatusCommandHandlerProps = {
	[ContainerServicesKeys.CATEGORY]: CategoryService;
	[ContainerInfraKeys.CACHE_MODULE]: ICacheModule;
};

class ToggleCategoryStatusCommandHandler
	implements CommandHandler<ToggleCategoryStatusCommand, ToggleCategoryStatusResponse>
{
	private readonly categoryService: CategoryService;
	private readonly cacheModule: ICacheModule;

	constructor({ categoryService, _cache_module }: ToggleCategoryStatusCommandHandlerProps) {
		this.categoryService = categoryService;
		this.cacheModule = _cache_module;
	}

	async execute(payload: ToggleCategoryStatusCommand): Promise<ToggleCategoryStatusResponse> {
		const category = await this.categoryService.retrieve(payload.id);
		if (!category) {
			throw new AppError(AppError.Types.NOT_FOUND, `Category with id ${payload.id} not found`);
		}

		const updatedCategory = await this.categoryService.update({
			id: category.id,
			isActive: !category.isActive,
		});

		// Clear the program cache
		await this.cacheModule.tags(['categories:discovery']).flush();

		return {
			category: updatedCategory,
		};
	}
}
export default ToggleCategoryStatusCommandHandler;
