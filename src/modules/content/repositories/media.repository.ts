import type { EntityRepository } from '@mikro-orm/core';
import type Media from '@/modules/content/entities/media.entity';
import { BaseRepository } from '@/types/base-repository';

export default class MediaRepository extends BaseRepository<Media> implements EntityRepository<Media> {}
