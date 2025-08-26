import type { EntityDTO } from '@mikro-orm/core';
import type User from '@/modules/auth/entities/user.entity';

export type UserDTO = Omit<EntityDTO<User>, 'passwordHash'>;
