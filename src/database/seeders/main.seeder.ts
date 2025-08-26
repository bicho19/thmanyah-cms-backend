import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import CategorySeeder from '@/database/seeders/category.seeder';
import { UserSeeder } from './user.seeder';

export class MainSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		// The `this.call()` method executes other seeders.
		// The order here is CRITICAL.

		// We must run them in an order that respects dependencies.
		return this.call(em, [UserSeeder, CategorySeeder]);
	}
}

// Add a default export for MikroORM's discovery
export default MainSeeder;
