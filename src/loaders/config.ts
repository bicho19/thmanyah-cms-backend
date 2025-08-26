import getConfigFile from '@utils/common/get-config-file';
import appLogger from '@/infra/logger/logger';
import type { ConfigModule } from '@/types/config-module';

export const handleConfigError = (error: Error): void => {
	appLogger.error(`Error in loading config: ${error.message}`);
	if (error.stack) {
		appLogger.error(error.stack);
	}
	process.exit(1);
};

export default async (rootDirectory: string): Promise<ConfigModule> => {
	const { configModule, error } = await getConfigFile<ConfigModule>(rootDirectory, 'app-config');

	if (error) {
		handleConfigError(error);
	}

	return {
		...configModule,
	};
};
