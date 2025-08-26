import { isDefined } from '@/core/utils/common/is-defined';
import type { FilterableProgramProps } from '@/modules/content/types/program.types';
import type { FilterQuery } from '@mikro-orm/core';
import type Program from '@/modules/content/entities/program.entity';

export class ProgramFilterBuilder {
  static build(filter: FilterableProgramProps): FilterQuery<Program> {
    const where: FilterQuery<Program> = {};

    if (isDefined(filter.id)) {
      where.id = { $in: Array.isArray(filter.id) ? filter.id : [filter.id] };
    }

    if (isDefined(filter.title)) {
      where.title = { $ilike: `%${filter.title}%` };
    }

    if (isDefined(filter.type)) {
      where.type = { $eq: filter.type };
    }

    if (isDefined(filter.status)) {
      where.status = { $eq: filter.status };
    }

    if (isDefined(filter.slug)) {
      where.slug = { $eq: filter.slug };
    }

    if (isDefined(filter.categoryId)) {
      where.category = { id: { $eq: filter.categoryId } };
    }

    return where;
  }
}
