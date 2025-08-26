import { ContainerInfraKeys } from '@/infra/constants';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';
import type { ConfigModule } from '@/types/config-module';

export type LoaderOptions<TOptions = Record<string, unknown>> = {
	container: AppContainer;
	[ContainerInfraKeys.CONFIG_MODULE]: ConfigModule;
	[ContainerInfraKeys.LOGGER]: AppLogger;
	options?: TOptions;
	dataLoaderOnly?: boolean;
};
