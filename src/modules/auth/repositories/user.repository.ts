import type { EntityRepository } from '@mikro-orm/core';
import type User from '@/modules/auth/entities/user.entity';
import { BaseRepository } from '@/types/base-repository';

export default class UserRepository extends BaseRepository<User> implements EntityRepository<User> {}
