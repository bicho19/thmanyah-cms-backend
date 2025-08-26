import type { EntityRepository } from '@mikro-orm/core';
import type Episode from '@/modules/content/entities/episode.entity';
import { BaseRepository } from '@/types/base-repository';

export default class EpisodeRepository
  extends BaseRepository<Episode>
  implements EntityRepository<Episode> {}
