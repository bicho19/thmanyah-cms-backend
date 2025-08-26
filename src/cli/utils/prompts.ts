import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

export function createPromptInterface() {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
}

export async function promptForModule(): Promise<string> {
	// Discover existing modules
	const existingModules = await discoverExistingModules();

	const rl = createPromptInterface();

	console.log('\n📁 Available modules:');
	if (existingModules.length > 0) {
		existingModules.forEach((module, index) => {
			console.log(`  ${index + 1}. ${module}`);
		});
		console.log('  Or type a new module name\n');
	} else {
		console.log('  No existing modules found. You can create a new one.\n');
	}

	return new Promise((resolve, reject) => {
		rl.question('Enter module name (or number): ', (answer) => {
			rl.close();

			if (!answer.trim()) {
				reject(new Error('Module name is required'));
				return;
			}

			// Check if it's a number (selecting existing module)
			const moduleIndex = Number.parseInt(answer.trim()) - 1;
			if (!Number.isNaN(moduleIndex) && existingModules[moduleIndex]) {
				resolve(existingModules[moduleIndex]);
				return;
			}

			// Validate module name
			const moduleName = answer.trim().toLowerCase();
			if (!/^[a-z][a-z0-9_-]*$/.test(moduleName)) {
				reject(
					new Error(
						'Module name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores',
					),
				);
				return;
			}

			resolve(moduleName);
		});
	});
}

export async function promptForMigrationName(): Promise<string> {
	const rl = createPromptInterface();

	console.log('\n📝 Migration name examples:');
	console.log('  • create_users_table');
	console.log('  • add_email_index');
	console.log('  • update_user_schema');
	console.log('  • add_user_preferences\n');

	return new Promise((resolve, reject) => {
		rl.question('Enter migration name: ', (answer) => {
			rl.close();

			if (!answer.trim()) {
				reject(new Error('Migration name is required'));
				return;
			}

			// Validate migration name
			const migrationName = answer.trim().toLowerCase();
			if (!/^[a-z][a-z0-9_]*$/.test(migrationName)) {
				reject(
					new Error(
						'Migration name must start with a letter and contain only lowercase letters, numbers, and underscores',
					),
				);
				return;
			}

			resolve(migrationName);
		});
	});
}

export async function promptForChoice<T>(message: string, choices: Array<{ label: string; value: T }>): Promise<T> {
	const rl = createPromptInterface();

	console.log(`\n${message}`);
	choices.forEach((choice, index) => {
		console.log(`  ${index + 1}. ${choice.label}`);
	});
	console.log('');

	return new Promise((resolve, reject) => {
		rl.question('Select an option (number): ', (answer) => {
			rl.close();

			const choiceIndex = Number.parseInt(answer.trim()) - 1;
			if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= choices.length) {
				reject(new Error('Invalid selection'));
				return;
			}

			resolve(choices[choiceIndex].value);
		});
	});
}

async function discoverExistingModules(): Promise<string[]> {
	const modulesDir = path.join(process.cwd(), 'src', 'modules');
	if (!fs.existsSync(modulesDir)) return [];

	return fs
		.readdirSync(modulesDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.filter((n) => !['index.ts', 'index.js', 'common', 'shared', 'utils'].includes(n))
		.sort();
}

export async function promptWithValidation(
	question: string,
	validator: (input: string) => string | null, // Returns error message or null if valid
): Promise<string> {
	const rl = createPromptInterface();

	const askQuestion = (): Promise<string> => {
		return new Promise((resolve, reject) => {
			rl.question(question, (answer) => {
				const error = validator(answer.trim());
				if (error) {
					console.log(`❌ ${error}`);
					askQuestion().then(resolve).catch(reject);
				} else {
					resolve(answer.trim());
				}
			});
		});
	};

	try {
		const result = await askQuestion();
		rl.close();
		return result;
	} catch (error) {
		rl.close();
		throw error;
	}
}
