import { ContainerServicesKeys } from '@/infra/constants';
import type { QueryHandler } from '@/lib/cqrs/query-handler';
import type CategoryService from '@/modules/content/services/category.service';
import type {
	FetchCategoriesQuery,
	FetchCategoriesResponse,
} from '@/modules/content/use-cases/categories/fetch-categories/fetch-categories.types';

type FetchCategoriesQueryHandlerProps = {
	[ContainerServicesKeys.CATEGORY]: CategoryService;
};

class FetchCategoriesQueryHandler implements QueryHandler<FetchCategoriesQuery, FetchCategoriesResponse> {
	private readonly categoryService: CategoryService;

	constructor({ categoryService }: FetchCategoriesQueryHandlerProps) {
		this.categoryService = categoryService;
	}

	async handle(query: FetchCategoriesQuery): Promise<FetchCategoriesResponse> {
		const categories = await this.categoryService.list({
			name: query.name,
			slug: query.slug,
			isActive: query.isActive,
		});

		return {
			categories,
		};
	}
}
export default FetchCategoriesQueryHandler;
