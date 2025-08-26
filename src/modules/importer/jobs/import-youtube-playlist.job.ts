import { ContainerInfraKeys } from '@/infra/constants';
import type { IJob } from '@/infra/job/types';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';

export type ImportYoutubePlaylistJobPayload = {
	url: string;
	programId: string;
};

export default class ImportYoutubePlaylistJob implements IJob<ImportYoutubePlaylistJobPayload> {
	async handle(payload: ImportYoutubePlaylistJobPayload, container: AppContainer): Promise<void> {
		const logger = container.resolve<AppLogger>(ContainerInfraKeys.LOGGER);

		logger.info({ payload }, 'Starting youtube import job');
	}
}

// Optional metadata for the loader
export const config = {
	name: 'import-youtube-playlist-job',
};
