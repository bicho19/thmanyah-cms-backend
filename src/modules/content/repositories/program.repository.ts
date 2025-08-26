import type { EntityRepository } from '@mikro-orm/core';
import type Program from '@/modules/content/entities/program.entity';
import { BaseRepository } from '@/types/base-repository';

export default class ProgramRepository extends BaseRepository<Program> implements EntityRepository<Program> {}
