import { join } from 'node:path';

/**
 * Attempts to resolve the config file in a given root directory.
 * @param {string} rootDir - the directory to find the config file in.
 * @param {string} configName - the name of the config file.
 * @return {object} an object containing the config module and its path as well as an error property if the config couldn't be loaded.
 */
async function getConfigFile<TConfig = unknown>(
	rootDir: string,
	configName: string,
): Promise<{ configModule: TConfig; configFilePath: string; error?: any }> {
	const configPath = join(rootDir, configName);
	let configFilePath = '';
	let configModule;
	let err: unknown = null;

	try {
		const module = await import(configPath);
		configModule = module.default ?? module; // handle both default and named
	} catch (e) {
		err = e;
	}

	if (configModule && typeof configModule.default === 'object') {
		configModule = configModule.default;
	}

	return { configModule, configFilePath, error: err };
}

export default getConfigFile;
