import { Migration } from '@mikro-orm/migrations';

export class ContentCreateEpisodesTable extends Migration {
	async up(): Promise<void> {
		this.addSql(`
      create table "episodes"
      (
        "id"                   varchar(36)   not null,
        "created_at"           timestamptz   not null default now(),
        "updated_at"           timestamptz   not null default now(),

        "title"                varchar(255)  not null,
        "description"          text          not null,
        "short_description"    text          null,
        "program_id"           varchar(36)   not null,
        "episode_number"       int           not null,
        "season_number"        int           null,
        "duration_seconds"     int           not null,
        "status"               text          not null default 'draft',
        "slug"                 varchar(255)  not null,
        "tags"                 text[]        not null default '{}',
        "publish_date"         timestamptz   null,
        "scheduled_publish_at" timestamptz   null,
        "show_notes"           text[]        not null default '{}',
        "thumbnail_url"        varchar(255)  null,
        "primary_media_type"   varchar(20)   not null,
        "view_count"           int           not null default 0,
        "like_count"           int           not null default 0,
        "share_count"          int           not null default 0,
        "rating"               numeric(3, 2) not null default 0,
        "rating_count"         int           not null default 0,

        constraint "episodes_pkey" primary key ("id")
      );
    `);

		// Constraints & Checks
		this.addSql(`alter table "episodes"
      add constraint "episodes_slug_unique" unique ("slug");`);
		this.addSql(`alter table "episodes"
      add constraint "episodes_status_check" check ("status" in
                                                    ('draft', 'review', 'scheduled', 'published', 'archived',
                                                     'deleted'));`);
		this.addSql(`alter table "episodes"
      add constraint "episodes_episode_number_check" check ("episode_number" >= 1);`);
		this.addSql(`alter table "episodes"
      add constraint "episodes_season_number_check" check ("season_number" is null or "season_number" >= 1);`);
		this.addSql(`alter table "episodes"
      add constraint "episodes_duration_check" check ("duration_seconds" > 0);`);
		this.addSql(`alter table "episodes"
      add constraint "episodes_rating_check" check ("rating" >= 0 and "rating" <= 5);`);

		// Foreign Key
		this.addSql(`alter table "episodes"
      add constraint "episodes_program_id_foreign" foreign key ("program_id") references "programs" ("id") on update cascade on delete cascade;`);

		// Indexes
		this.addSql(`create index "episodes_program_id_index" on "episodes" ("program_id");`);
		this.addSql(`create index "episodes_status_index" on "episodes" ("status");`);
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists "episodes" cascade;');
	}
}
