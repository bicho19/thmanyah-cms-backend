import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
// @ts-ignore
import Scrypt from 'scrypt-kdf';
import User from '@/modules/auth/entities/user.entity';

const USERS_DATA = [
	{
		first_name: 'Hachemi',
		last_name: 'Hamadi',
		email: 'hachemi@example.com',
		phone: '+21355000000',
		password: 'test12345',
	},
];

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		console.log('🌱 Seeding users ...');

		const existingUsers = await em.find(User, {});
		const existingUserEmails = new Set(existingUsers.map((u) => u.email));
		console.log(`🔍 Found ${existingUserEmails.size} existing users in the database.`);

		const usersToCreate: User[] = [];

		for (const userData of USERS_DATA) {
			if (!existingUserEmails.has(userData.email)) {
				const passwordHash = (await Scrypt.kdf(userData.password, { logN: 15 })).toString('base64');

				const user = new User();
				user.firstName = userData.first_name;
				user.firstName = userData.last_name;
				user.email = userData.email;
				user.phone = userData.phone;
				user.passwordHash = passwordHash;
				usersToCreate.push(user);
			}
		}

		if (usersToCreate.length > 0) {
			console.log(`➕ Creating ${usersToCreate.length} new users...`);
			em.persist(usersToCreate);
		} else {
			console.log('✅ All users are already up-to-date.');
		}

		await em.flush();

		console.log('Users seeding complete.');
	}
}

export default UserSeeder;
