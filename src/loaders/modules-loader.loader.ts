import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCurrentDirName } from '@utils/current-dir-name';
import glob from 'fast-glob';
import type { LoaderOptions } from '@/types/loader';

/**
 * Run module loaders
 */
export default async ({ container, configModule, logger }: LoaderOptions): Promise<void> => {
	logger.info('------  Running Modules loaders ------ ');
	const corePath = '../modules/**/loaders/*.{ts,js}';
	const coreFull = path.join(getCurrentDirName(import.meta.url), corePath);

	const files = glob.sync(coreFull, { cwd: getCurrentDirName(import.meta.url) });

	logger.info({ files }, `There are ${files.length} files found`);
	for (const file of files) {
		try {
			const module = await import(pathToFileURL(file).href);
			const loaded = module.default ?? module;
			if (loaded) {
				await loaded({ container, configModule, logger });
			}
		} catch (error) {
			console.error(`Could not module loader from ${file}:`, error);
		}
	}
};
