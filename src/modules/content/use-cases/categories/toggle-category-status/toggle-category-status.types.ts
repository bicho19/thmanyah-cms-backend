import type { CategoryDTO } from '@/modules/content/types/category.types';

export type ToggleCategoryStatusCommand = {
	id: string;
};

export type ToggleCategoryStatusResponse = {
	category: CategoryDTO;
};
