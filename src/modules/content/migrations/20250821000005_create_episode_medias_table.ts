import { Migration } from '@mikro-orm/migrations';

export class ContentCreateEpisodeMediaSTable extends Migration {
	async up(): Promise<void> {
		this.addSql(`
      create table "episode_medias"
      (
        "id"              varchar(255) not null,
        "episode_id"      varchar(255) not null,
        "type"            varchar(20)  not null,
        "url"             text         not null,
        "source"          varchar(20)  not null,
        "mime_type"       varchar(255) null,
        "quality_label"   varchar(255) null,
        "file_size_bytes" bigint       null,
        "sort_order"      int          not null default 0,
        "created_at"      timestamptz  not null default now(),
        "updated_at"      timestamptz  not null default now(),
        constraint "episode_medias_pkey" primary key ("id")
      );
    `);

		// Foreign key constraint
		this.addSql(`
      alter table "episode_medias"
        add constraint "episode_medias_episode_id_foreign"
          foreign key ("episode_id")
            references "episodes" ("id")
            on update cascade on delete cascade;
    `);

		// Type checks
		this.addSql(`
      alter table "episode_medias"
        add constraint "episode_medias_type_check"
          check ("type" in ('video', 'audio'));
    `);

		this.addSql(`
      alter table "episode_medias"
        add constraint "episode_medias_source_check"
          check ("source" in ('upload', 'youtube', 'spotify', 'external'));
    `);

		// Indexes for common lookups
		this.addSql(`create index "episode_medias_episode_id_index" on "episode_medias" ("episode_id");`);
		this.addSql(`create index "episode_medias_type_index" on "episode_medias" ("type");`);
		this.addSql(`create index "episode_medias_source_index" on "episode_medias" ("source");`);
		this.addSql(`create index "episode_medias_sort_order_index" on "episode_medias" ("sort_order");`);

		// To ensure uniqueness of url per episode
		this.addSql(`
      create unique index "episode_medias_episode_id_url_unique"
        on "episode_medias" ("episode_id", "url");
    `);
	}

	async down(): Promise<void> {
		this.addSql(`drop table if exists "episode_medias" cascade;`);
	}
}
