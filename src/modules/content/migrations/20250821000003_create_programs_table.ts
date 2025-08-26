import { Migration } from '@mikro-orm/migrations';

export class ContentCreateProgramsTable extends Migration {
	async up(): Promise<void> {
		// Create the base table
		this.addSql(`
      create table "programs"
      (
        "id"                   text          not null,
        "title"                varchar(255)  not null,
        "description"          text          not null,
        "short_description"    text          null,
        "type"                 varchar(20)   not null,
        "status"               varchar(20)   not null default 'draft',
        "category_id"          text          not null,
        "tags"                 text[]        not null default '{}',
        "slug"                 varchar(255)  not null,
        "thumbnail_url"        varchar(255)  null,
        "banner_url"           varchar(255)  null,
        "total_episodes"       int           not null default 0,
        "total_views"          int           not null default 0,
        "average_rating"       numeric(3, 2) not null default 0,
        "total_ratings"        int           not null default 0,
        "published_at"         timestamptz   null,
        "scheduled_publish_at" timestamptz   null,
        "created_at"           timestamptz   not null default now(),
        "updated_at"           timestamptz   not null default now(),

        constraint "programs_pkey" primary key ("id")
      );
    `);

		// Unique constraints
		this.addSql(`alter table "programs"
      add constraint "programs_slug_unique" unique ("slug");`);

		// Foreign keys
		this.addSql(`
      alter table "programs"
        add constraint "programs_category_id_foreign"
          foreign key ("category_id") references "categories" ("id")
            on update cascade on delete restrict;
    `);

		// Indexes
		this.addSql(`create index "programs_slug_index" on "programs" ("slug");`);
		this.addSql(`create index "programs_type_index" on "programs" ("type");`);
		this.addSql(`create index "programs_status_index" on "programs" ("status");`);
		this.addSql(`create index "programs_category_id_index" on "programs" ("category_id");`);
		this.addSql(`create index "programs_published_at_index" on "programs" ("published_at");`);
		this.addSql(`create index "programs_scheduled_publish_at_index" on "programs" ("scheduled_publish_at");`);

		// --- Checks ---
		this.addSql(`
      alter table "programs"
        add constraint "programs_type_check"
          check ("type" in ('podcast', 'documentary', 'interview'));
    `);

		this.addSql(`
      alter table "programs"
        add constraint "programs_status_check"
          check ("status" in ('draft', 'review', 'scheduled', 'published', 'archived', 'deleted'));
    `);

		this.addSql(`
      alter table "programs"
        add constraint "programs_average_rating_check"
          check ("average_rating" >= 0 and "average_rating" <= 5);
    `);

		this.addSql(`
      alter table "programs"
        add constraint "programs_total_episodes_check"
          check ("total_episodes" >= 0);
    `);

		this.addSql(`
      alter table "programs"
        add constraint "programs_total_views_check"
          check ("total_views" >= 0);
    `);

		this.addSql(`
      alter table "programs"
        add constraint "programs_total_ratings_check"
          check ("total_ratings" >= 0);
    `);
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists "programs" cascade;');
	}
}
