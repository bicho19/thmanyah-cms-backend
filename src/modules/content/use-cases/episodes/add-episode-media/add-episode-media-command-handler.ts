import { ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type EpisodeService from '@/modules/content/services/episode.service';
import type {
	AddEpisodeMediaCommand,
	AddEpisodeMediaResponse,
} from '@/modules/content/use-cases/episodes/add-episode-media/add-episode-media-command.types';

type AddEpisodeMediaCommandHandlerProps = {
	[ContainerServicesKeys.EPISODE]: EpisodeService;
};

class AddEpisodeMediaCommandHandler implements CommandHandler<AddEpisodeMediaCommand, AddEpisodeMediaResponse> {
	private readonly episodeService: EpisodeService;

	constructor({ episodeService }: AddEpisodeMediaCommandHandlerProps) {
		this.episodeService = episodeService;
	}

	async execute(command: AddEpisodeMediaCommand): Promise<AddEpisodeMediaResponse> {
		return this.episodeService.addMediaToEpisode(command);
	}
}

export default AddEpisodeMediaCommandHandler;
