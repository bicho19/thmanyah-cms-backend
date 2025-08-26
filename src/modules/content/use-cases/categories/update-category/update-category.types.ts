import type { CategoryDTO } from '@/modules/content/types/category.types';

export type UpdateCategoryCommand = {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	iconUrl?: string;
	color?: string;
	sortOrder?: number;
};

export type UpdateCategoryResponse = {
	category: CategoryDTO;
};
