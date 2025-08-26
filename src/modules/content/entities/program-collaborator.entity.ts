import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { AppBaseEntity } from '@/types/base.entity';
import Program from '@/modules/content/entities/program.entity';

export type CollaboratorRole = 'owner' | 'editor' | 'contributor' | 'viewer';

@Entity({tableName: 'program_collaborators'})
export class ProgramCollaborator extends AppBaseEntity {

  @ManyToOne(() => Program)
  program: Program;

  // Reference to User entity from auth module
  @Property()
  userId: string;

  @Property()
  userEmail: string;

  @Property()
  userName: string;

  @Property()
  role: CollaboratorRole;

  @Property({ default: true })
  canEdit: boolean = true;

  @Property({ default: false })
  canPublish: boolean = false;

  @Property({ default: false })
  canDelete: boolean = false;
}
