import type { CategoryDTO } from '@/modules/content/types/category.types';

export type FetchCategoriesQuery = {
	name?: string | null;
	slug?: string | null;
	isActive?: boolean | null;
};

export type FetchCategoriesResponse = {
	categories: CategoryDTO[];
};
