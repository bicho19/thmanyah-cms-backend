import type { CategoryDTO } from '@/modules/content/types/category.types';

export type AddCategoryCommand = {
	name: string;
	slug: string;
	description?: string | null;
	iconUrl?: string | null;
	color?: string | null;
	sortOrder?: number | null;
};

export type AddCategoryResponse = {
	category: CategoryDTO;
};
