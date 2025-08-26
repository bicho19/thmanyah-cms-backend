import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCurrentDirName } from '@utils/current-dir-name';
import { formatRegistrationNameWithoutNamespace } from '@utils/format-registration-name';
import { asClass } from 'awilix';
import glob from 'fast-glob';
import { ContainerInfraKeys } from '@/infra/constants';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';
import type { ConfigModule } from '@/types/config-module';

type Options = {
	container: AppContainer;
	[ContainerInfraKeys.CONFIG_MODULE]: ConfigModule;
	[ContainerInfraKeys.LOGGER]: AppLogger;
};

/**
 * Registers services in the modules directory
 */
export default async ({ container, configModule, logger }: Options): Promise<void> => {
	logger.info(' ----- Initializing services -----');

	const corePath = '../modules/**/services/*.service.{ts,js}';
	const coreFull = path.join(getCurrentDirName(import.meta.url), corePath);

	const files = glob.sync(coreFull, { cwd: getCurrentDirName(import.meta.url) });
	for (const file of files) {
		try {
			const module = await import(pathToFileURL(file).href);
			const loaded = module.default ?? module;
			if (loaded) {
				const registrationName = formatRegistrationNameWithoutNamespace(file);

				// This was a singleton registration, and was changed to scoped so that
				// it will re-created whenever a request coming in
				// This will help us keep the same context as the request
				container.register({
					[registrationName]: asClass(loaded).scoped(),
				});
				logger.info(`Registered service: ${registrationName}`);
			}
		} catch (err) {
			console.error(`Could not import service from ${file}:`, err);
		}
	}
	logger.info('Services initialized ...');
};
