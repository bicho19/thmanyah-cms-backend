import { isDefined } from '@/core/utils/common/is-defined';
import type { FilterableCategoryProps } from '@/modules/content/types/category.types';
import type { FilterQuery } from '@mikro-orm/core';
import type Category from '@/modules/content/entities/category.entity';

export class CategoryFilterBuilder {
  static build(filter: FilterableCategoryProps): FilterQuery<Category> {
    const where: FilterQuery<Category> = {};

    if (isDefined(filter.id)) {
      where.id = { $in: Array.isArray(filter.id) ? filter.id : [filter.id] };
    }

    if (isDefined(filter.name)) {
      where.name = { $ilike: `%${filter.name}%` };
    }

    if (isDefined(filter.slug)) {
      where.slug = { $eq: filter.slug };
    }

    if (isDefined(filter.isActive)) {
      where.isActive = filter.isActive;
    }

    return where;
  }
}
