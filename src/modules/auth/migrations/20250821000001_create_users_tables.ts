import { Migration } from '@mikro-orm/migrations';

export class AuthCreateUsersTable extends Migration {
	async up(): Promise<void> {
		// Create 'users' table
		this.addSql(
			`create table "users"
       (
         "id"                      text           not null,
         "first_name"              varchar(255)   not null,
         "last_name"               varchar(255)   not null,
         "email"                   varchar(255)   not null,
         "phone"                   varchar(255)   not null,
         "password_hash"           varchar(255)   not null,
         "is_active"               boolean        not null default true,
         "last_login_at"           timestamptz(0) null,
         "last_seen_at"            timestamptz(0) null,
         "created_at"              timestamptz(0) not null default now(),
         "updated_at"              timestamptz(0) not null default now(),
         "deleted_at"              timestamptz(0) null,
         constraint "users_pkey" primary key ("id")
       );`,
		);
		this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');
		this.addSql('alter table "users" add constraint "users_phone_unique" unique ("phone");');
	}

	async down(): Promise<void> {
		this.addSql('drop table if exists "users" cascade;');
	}
}
