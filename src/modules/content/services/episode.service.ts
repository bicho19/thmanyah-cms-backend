import { type EntityManager, wrap } from '@mikro-orm/core';
import { tryCatch } from '@utils/try-catch';
import { serializeError } from 'serialize-error';
import type { FindConfig } from '@/common/find-config';
import { BaseService } from '@/common/services/base-service';
import { isDefined } from '@/core/utils/common/is-defined';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import AppError from '@/lib/exceptions/errors';
import type Episode from '@/modules/content/entities/episode.entity';
import type EpisodeRepository from '@/modules/content/repositories/episode.repository';
import type MediaRepository from '@/modules/content/repositories/media.repository';
import { EpisodeFilterBuilder } from '@/modules/content/types/episode.filter-builder';
import type {
	AddEpisodeInput,
	EpisodeDTO,
	FilterableEpisodeProps,
	UpdateEpisodeCommand,
} from '@/modules/content/types/episode.types';
import type { AddEpisodeMediaInput, MediaDTO } from '@/modules/content/types/media.types';
import type { AppLogger } from '@/types/common';

type EpisodeServiceProps = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerInfraKeys.DATABASE_EM]: EntityManager;
	[ContainerRepositoriesKeys.EPISODE]: EpisodeRepository;
	[ContainerRepositoriesKeys.MEDIA]: MediaRepository;
};

export default class EpisodeService extends BaseService<Episode> {
	protected readonly logger: AppLogger;
	protected readonly eventBus: AbstractEventBus;
	protected readonly entityManager: EntityManager;
	protected readonly episodeRepository: EpisodeRepository;
	protected readonly mediaRepository: MediaRepository;

	constructor({ logger, _database_em, _event_bus, episodeRepository, mediaRepository }: EpisodeServiceProps) {
		super();
		this.logger = logger;
		this.entityManager = _database_em;
		this.eventBus = _event_bus;
		this.episodeRepository = episodeRepository;
		this.mediaRepository = mediaRepository;
	}

	async addMediaToEpisode(input: AddEpisodeMediaInput): Promise<MediaDTO> {
		const { episodeId, ...mediaData } = input;

		const episode = await this.episodeRepository.findOne({ id: episodeId });

		if (!episode) {
			throw new AppError(AppError.Types.NOT_FOUND, `Episode with id ${episodeId} not found`);
		}

		const [error, newMedia] = await tryCatch(async () => {
			const media = this.mediaRepository.create({
				episode,
				type: mediaData.type,
				fileSizeBytes: mediaData.fileSizeBytes,
				mimeType: mediaData.mimeType,
				qualityLabel: mediaData.qualityLabel,
				url: mediaData.url,
				source: mediaData.source,
				sortOrder: mediaData.sortOrder ?? 0,
			});

			episode.mediaFiles.add(media);

			if (!episode.primaryMediaType) {
				episode.primaryMediaType = media.type;
			}

			return media;
		});

		if (error) {
			this.logger.error({ error: serializeError(error) }, 'Could not create media entity for episode.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not add media to episode.');
		}

		await this.entityManager.flush();

		const dto = wrap(newMedia).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'episode.media.added',
				data: { episodeId: episode.id, mediaId: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}

	async list(filter: FilterableEpisodeProps = {}, config: FindConfig<Episode> = {}): Promise<EpisodeDTO[]> {
		const where = EpisodeFilterBuilder.build(filter);
		const opts = this.toFindOptions(config);

		const episodes = await this.episodeRepository.find(where, opts);

		return episodes.map((e) => wrap(e).toJSON());
	}

	async count(filter: FilterableEpisodeProps = {}): Promise<number> {
		const where = EpisodeFilterBuilder.build(filter);
		return this.episodeRepository.count(where);
	}

	async retrieve(episodeId: string, config: FindConfig<Episode> = {}): Promise<EpisodeDTO | null> {
		if (!isDefined(episodeId)) {
			throw new AppError(AppError.Types.NOT_FOUND, `"episodeId" must be defined`);
		}

		const opts = this.toFindOptions(config);
		const episode = await this.episodeRepository.findOne({ id: episodeId }, opts);

		if (!episode) {
			return null;
		}

		return wrap(episode).toJSON();
	}

	async createEntity(input: AddEpisodeInput): Promise<Episode> {
		// check the slug
		const slugExists = await this.episodeRepository.findOne({ slug: input.slug }, { fields: ['id'] });
		if (slugExists) {
			throw new AppError(AppError.Types.CONFLICT, `A episode with the slug '${input.slug}' already exists`);
		}
		const [error, created] = await tryCatch(async () => {
			return this.episodeRepository.create({
				title: input.title,
				description: input.description,
				slug: input.slug,
				program: input.programId,
				episodeNumber: input.episodeNumber,
				durationSeconds: input.duration,
				publishDate: null,
				shortDescription: input.shortDescription,
				seasonNumber: input.seasonNumber,
				thumbnailUrl: input.thumbnailUrl,
				tags: input.tags,
				showNotes: input.showNotes,
				status: 'draft',
				scheduledPublishAt: null,
				likeCount: 0,
				rating: 0,
				ratingCount: 0,
				shareCount: 0,
				viewCount: 0,
			});
		});

		if (error) {
			this.logger.error({ error: serializeError(error) }, 'Could not create episode entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not create episode.');
		}

		return created;
	}

	async create(input: AddEpisodeInput): Promise<EpisodeDTO> {
		const entity = await this.createEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'episode.created',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}

	async updateEntity(input: UpdateEpisodeCommand): Promise<Episode> {
		const episode = await this.episodeRepository.findOne({ id: input.id });

		if (!episode) {
			throw new AppError(AppError.Types.NOT_FOUND, `Episode with id ${input.id} not found`);
		}

		if (input.slug && input.slug !== episode.slug) {
			const existing = await this.episodeRepository.findOne({ slug: input.slug });
			if (existing) {
				throw new AppError(AppError.Types.CONFLICT, `An episode with the slug '${input.slug}' already exists`);
			}
		}

		const [error, updated] = await tryCatch(async () => {
			const { id, ...data } = input;

			for (const key of Object.keys(data)) {
				data[key] === undefined ? delete data[key] : {};
			}

			wrap(episode).assign(data);

			return episode;
		});

		if (error) {
			if (error instanceof AppError) {
				throw error;
			}
			this.logger.error({ error: serializeError(error) }, 'Could not update episode entity.');
			throw new AppError(AppError.Types.SERVER_ERROR, 'Could not update episode.');
		}

		return updated;
	}

	async update(input: UpdateEpisodeCommand): Promise<EpisodeDTO> {
		const entity = await this.updateEntity(input);

		await this.entityManager.persistAndFlush(entity);

		const dto = wrap(entity).toObject();

		const correlationId = (this.logger.bindings()?.correlationId as string) ?? '';
		await this.eventBus.emit(
			{
				name: 'episode.updated',
				data: { id: dto.id },
				metadata: { correlationId, timestamp: Date.now() },
			},
			{},
		);

		return dto;
	}
}
