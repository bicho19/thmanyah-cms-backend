import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCurrentDirName } from '@utils/current-dir-name';
import { asClass } from 'awilix';
import glob from 'fast-glob';
import { ContainerInfraKeys } from '@/infra/constants';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';

type Options = {
	container: AppContainer;
};

/**
 * Registers command and query handlers in the modules directory
 */
export default async ({ container }: Options): Promise<void> => {
	const handlersPath = '../modules/**/use-cases/**/*-handler.{ts,js}';
	const resolvedPath = path.join(getCurrentDirName(import.meta.url), handlersPath);
	const logger: AppLogger = container.resolve(ContainerInfraKeys.LOGGER);

	const handlerFiles = glob.sync(resolvedPath, {
		cwd: getCurrentDirName(import.meta.url),
	});

	logger.debug({ handlerFiles }, 'List of command/query handlers');

	for (const file of handlerFiles) {
		try {
			const module = await import(pathToFileURL(file).href);

			// typical class default export
			const HandlerClass = module.default;

			// sanity check to avoid registering random files
			if (
				typeof HandlerClass === 'function' &&
				(HandlerClass.name.endsWith('CommandHandler') || HandlerClass.name.endsWith('QueryHandler'))
			) {
				// Handle naming by namespace
				// EX: links.createLinkCommandHandler
				const fileParts = file.split(path.sep);
				const moduleName = fileParts[fileParts.indexOf('modules') + 1];
				const registrationName = `${moduleName}.${HandlerClass.name.charAt(0).toLowerCase() + HandlerClass.name.slice(1)}`;

				// With scoped registration, When this dependency is resolved from a scoped container,
				// create a new instance of it that lives for the duration of that scope.
				// And DO NOT reuse an instance from another request.
				container.register({
					[registrationName]: asClass(HandlerClass).scoped(),
				});

				logger.debug(`Registered handler: ${registrationName}`);
			}
		} catch (err) {
			logger.error(`Could not import handler from ${file}: ${err}`);
		}
	}
};
