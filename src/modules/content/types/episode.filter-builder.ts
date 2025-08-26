import { isDefined } from '@/core/utils/common/is-defined';
import type { FilterableEpisodeProps } from '@/modules/content/types/episode.types';
import type { FilterQuery } from '@mikro-orm/core';
import type Episode from '@/modules/content/entities/episode.entity';

export class EpisodeFilterBuilder {
  static build(filter: FilterableEpisodeProps): FilterQuery<Episode> {
    const where: FilterQuery<Episode> = {};

    if (isDefined(filter.id)) {
      where.id = { $in: Array.isArray(filter.id) ? filter.id : [filter.id] };
    }

    if (isDefined(filter.title)) {
      where.title = { $ilike: `%${filter.title}%` };
    }

    if (isDefined(filter.status)) {
      where.status = { $eq: filter.status };
    }

    if (isDefined(filter.slug)) {
      where.slug = { $eq: filter.slug };
    }

    if (isDefined(filter.programId)) {
      where.program = { id: { $eq: filter.programId } };
    }

    return where;
  }
}
