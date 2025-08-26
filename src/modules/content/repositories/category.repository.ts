import type { EntityRepository } from '@mikro-orm/core';
import type Category from '@/modules/content/entities/category.entity';
import { BaseRepository } from '@/types/base-repository';

export default class CategoryRepository
  extends BaseRepository<Category>
  implements EntityRepository<Category> {}
