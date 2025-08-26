import { Migration } from '@mikro-orm/migrations';

export class ContentCreateCategoriesTable extends Migration {
	async up(): Promise<void> {
		this.addSql(
			`create table "categories"
       (
         "id"                      text           not null,
         "name"                    varchar(255)   not null,
         "slug"                    varchar(255)   not null,
         "description"             text           null,
         "icon_url"                varchar(255)   null,
         "color"                   varchar(255)   null,
         "sort_order"              integer        not null default 0,
         "is_active"               boolean        not null default true,
         "created_at"              timestamptz(0) not null default now(),
         "updated_at"              timestamptz(0) not null default now(),
         "deleted_at"              timestamptz(0) null,
         constraint "categories_pkey" primary key ("id")
       );`,
		);
		this.addSql('alter table "categories" add constraint "categories_slug_unique" unique ("slug");');
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists "categories" cascade;');
	}
}
