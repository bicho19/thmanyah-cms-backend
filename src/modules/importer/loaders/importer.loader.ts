import { asClass, asFunction, Lifetime } from 'awilix';
import { ContainerServicesKeys } from '@/infra/constants';
import { YouTubeImporter } from '@/modules/importer/providers/youtube.importer';
import ImportService from '@/modules/importer/services/import.service';
import type { LoaderOptions } from '@/types/loader';

/**
 * The loader for the Importer module.
 *
 * This function is automatically discovered and executed by the main module loader.
 * Its purpose is to register all the services, repositories, and other components
 * related to the importer functionality into the DI container.
 */
export default async ({ container, configModule, logger }: LoaderOptions): Promise<void> => {
	logger.info('  -> Loading Importer Module...');

	//  Register Concrete Importer Implementations ---
	// Each specific importer (YouTube, Spotify, etc.) is registered as a singleton.
	// We inject any necessary configuration, like API keys, directly here.
	container.register({
		youtubeImporter: asClass(YouTubeImporter, {
			lifetime: Lifetime.SINGLETON,
			injector: () => ({ apiKey: configModule.integrations?.youtube?.apiKey }),
		}),
	});
	logger.debug('    - Registered concrete importers (YouTube, etc.)');

	// Register the Array of All Importers ---
	// This is a powerful pattern that gathers all individual importers into a single
	// array dependency. The ImportService will then consume this array.
	// When you add a new importer (e.g., spotifyImporter), just add it to this function's dependencies.
	container.register({
		importers: asFunction(({ youtubeImporter }) => {
			return [youtubeImporter];
		}).singleton(),
	});
	logger.debug('    - Registered the collective `importers` array');

	// --- 3. Register the Main Orchestrator Service ---
	// The ImportService depends on the `importers` array we just defined,
	// along with other core services that Awilix will resolve automatically.
	container.register({
		[ContainerServicesKeys.IMPORT_SERVICE]: asClass(ImportService, { lifetime: Lifetime.SCOPED }),
	});
	logger.debug('    - Registered ImportService');
};
