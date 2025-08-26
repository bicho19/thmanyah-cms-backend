import { Migration } from '@mikro-orm/migrations';

export class DiscoveryAddFullTextSearch extends Migration {
	async up(): Promise<void> {
		// Create the function that will be used by the trigger.
		// This function concatenates and weights the relevant fields into a tsvector.
		this.addSql(`
      CREATE OR REPLACE FUNCTION update_program_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.search_vector :=
              setweight(to_tsvector('arabic', COALESCE(NEW.title, '')), 'A') ||
              setweight(to_tsvector('arabic', COALESCE(NEW.description, '')), 'B') ||
              setweight(to_tsvector('arabic', array_to_string(NEW.tags, ' ')), 'C');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

		// Add the tsvector column to the 'programs' table and create the GIN index.
		// It's efficient to do both in one command.
		this.addSql(`
      ALTER TABLE "programs"
      ADD COLUMN "search_vector" tsvector;
      CREATE INDEX "programs_search_vector_idx" ON "programs" USING GIN("search_vector");
    `);

		// Create the trigger that automatically calls the function on every insert or update.
		this.addSql(`
      CREATE TRIGGER "program_vector_update"
      BEFORE INSERT OR UPDATE ON "programs"
      FOR EACH ROW EXECUTE FUNCTION update_program_search_vector();
    `);
	}

	async down(): Promise<void> {
		// To reverse, we drop everything in the reverse order of creation.

		// Drop the trigger from the table.
		this.addSql(`DROP TRIGGER IF EXISTS "program_vector_update" ON "programs";`);

		// Drop the function.
		this.addSql('DROP FUNCTION IF EXISTS update_program_search_vector();');

		// Drop the column (and its index will be dropped automatically).
		this.addSql(`ALTER TABLE "programs" DROP COLUMN "search_vector";`);
	}
}
