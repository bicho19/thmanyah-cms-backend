import type { EntityDTO } from '@mikro-orm/core';
import type Category from '@/modules/content/entities/category.entity';

export type CategoryDTO = EntityDTO<Category>;

export type FilterableCategoryProps = {
	id?: string | string[];
	name?: string | null;
	slug?: string | null;
	isActive?: boolean | null;
};

export type AddCategoryInput = {
	name: string;
	slug: string;
	description?: string | null;
	iconUrl?: string | null;
	color?: string | null;
	sortOrder?: number | null;
};

export type UpdateCategoryCommand = {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	iconUrl?: string;
	color?: string;
	sortOrder?: number;
	isActive?: boolean;
};
