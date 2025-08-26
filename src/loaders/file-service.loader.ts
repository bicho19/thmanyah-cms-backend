import { asClass } from 'awilix';
import { ContainerInfraKeys } from '@/infra/constants';
import DefaultFileService from '@/infra/file-service/default-file-service';
import LocalFileService from '@/infra/file-service/local-file-service';
import S3FileService from '@/infra/file-service/s3/s3-file-service';
import type { AppContainer } from '@/lib/app-container';
import AppError from '@/lib/exceptions/errors';
import type { AppLogger } from '@/types/common';
import type { ConfigModule } from '@/types/config-module';

type FileServiceLoaderDependencies = {
	container: AppContainer;
	[ContainerInfraKeys.CONFIG_MODULE]: ConfigModule;
	[ContainerInfraKeys.LOGGER]: AppLogger;
};

export default async ({ container, configModule, logger }: FileServiceLoaderDependencies): Promise<void> => {
	logger.info('------  Initializing File Module ------ ');

	const fileServiceConfig = configModule.fileService;

	let provider = fileServiceConfig?.provider;
	if (!fileServiceConfig || !provider) {
		provider = 'default';
	}
	logger.info(`Initializing File Service with provider: ${provider}`);

	switch (provider) {
		case 's3':
			if (!fileServiceConfig?.s3Options) {
				throw new AppError(
					AppError.Types.UNEXPECTED_STATE,
					'S3 file service provider selected, but options are missing in config.',
				);
			}
			container.register(
				ContainerInfraKeys.FILE_SERVICE,
				asClass(S3FileService)
					.inject(() => ({
						logger: container.resolve(ContainerInfraKeys.LOGGER),
						options: fileServiceConfig?.s3Options,
					}))
					.singleton(),
			);
			break;

		case 'local':
			container.register(
				ContainerInfraKeys.FILE_SERVICE,
				asClass(LocalFileService)
					.inject(() => ({
						logger: container.resolve(ContainerInfraKeys.LOGGER),
						options: fileServiceConfig?.localOptions,
					}))
					.singleton(),
			);
			break;

		// Add more cases here

		default:
			logger.warn('No file service provider specified. Using default placeholder.');
			container.register(ContainerInfraKeys.FILE_SERVICE, asClass(DefaultFileService).singleton());
			break;
	}
};
