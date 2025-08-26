import type { FastifyReply, FastifyRequest } from 'fastify';
import type AddCategoryCommandHandler from '@/modules/content/use-cases/categories/add-category/add-category-command-handler';
import type FetchCategoriesQueryHandler from '@/modules/content/use-cases/categories/fetch-categories/fetch-categories-query-handler';
import type ToggleCategoryStatusCommandHandler from '@/modules/content/use-cases/categories/toggle-category-status/toggle-category-status-command-handler';
import type UpdateCategoryCommandHandler from '@/modules/content/use-cases/categories/update-category/update-category-command-handler';
import type AddEpisodeCommandHandler from '@/modules/content/use-cases/episodes/add-episode/add-episode-command-handler';
import type AddEpisodeMediaCommandHandler from '@/modules/content/use-cases/episodes/add-episode-media/add-episode-media-command-handler';
import type FetchEpisodeQueryHandler from '@/modules/content/use-cases/episodes/fetch-episode/fetch-episode-query-handler';
import type FetchEpisodesQueryHandler from '@/modules/content/use-cases/episodes/fetch-episodes/fetch-episodes-query-handler';
import type PublishEpisodeCommandHandler from '@/modules/content/use-cases/episodes/publish-episode/publish-episode-command-handler';
import type UnpublishEpisodeCommandHandler from '@/modules/content/use-cases/episodes/unpublish-episode/unpublish-episode-command-handler';
import type UpdateEpisodeCommandHandler from '@/modules/content/use-cases/episodes/update-episode/update-episode-command-handler';
import type AddProgramCommandHandler from '@/modules/content/use-cases/programs/add-program/add-program-command-handler';
import type FetchProgramQueryHandler from '@/modules/content/use-cases/programs/fetch-program/fetch-program-query-handler';
import type FetchProgramsQueryHandler from '@/modules/content/use-cases/programs/fetch-programs/fetch-programs-query-handler';
import type PublishProgramCommandHandler from '@/modules/content/use-cases/programs/publish-program/publish-program-command-handler';
import type ScheduleProgramCommandHandler from '@/modules/content/use-cases/programs/schedule-program/schedule-program-command-handler';
import type UnpublishProgramCommandHandler from '@/modules/content/use-cases/programs/unpublish-program/unpublish-program-command-handler';
import type UpdateProgramCommandHandler from '@/modules/content/use-cases/programs/update-program/update-program-command-handler';
import type { AddCategoryBody } from '@/web/api/content/api-contract/add-category.contract';
import type { AddEpisodeBody } from '@/web/api/content/api-contract/add-episode.contract';
import type {
	AddEpisodeMediaBody,
	AddEpisodeMediaParams,
} from '@/web/api/content/api-contract/add-episode-media.contract';
import type { AddProgramBody } from '@/web/api/content/api-contract/add-program.contract';
import type { FetchCategoriesQuery } from '@/web/api/content/api-contract/fetch-categories.contract';
import type { FetchEpisodeParams } from '@/web/api/content/api-contract/fetch-episode.contract';
import type { FetchEpisodesQuery } from '@/web/api/content/api-contract/fetch-episodes.contract';
import type { FetchProgramParams } from '@/web/api/content/api-contract/fetch-program.contract';
import type { FetchProgramsQuery } from '@/web/api/content/api-contract/fetch-programs.contract';
import type { PublishEpisodeParams } from '@/web/api/content/api-contract/publish-episode.contract';
import type { PublishProgramParams } from '@/web/api/content/api-contract/publish-program.contract';
import type {
	ScheduleProgramBody,
	ScheduleProgramParams,
} from '@/web/api/content/api-contract/schedule-program.contract';
import type { ToggleCategoryParams } from '@/web/api/content/api-contract/toggle-category-status.contract';
import type { UnpublishEpisodeParams } from '@/web/api/content/api-contract/unpublish-episode.contract';
import type { UnpublishProgramParams } from '@/web/api/content/api-contract/unpublish-program.contract';
import type { UpdateCategoryBody, UpdateCategoryParams } from '@/web/api/content/api-contract/update-category.contract';
import type { UpdateEpisodeBody, UpdateEpisodeParams } from '@/web/api/content/api-contract/update-episode.contract';
import type { UpdateProgramBody, UpdateProgramParams } from '@/web/api/content/api-contract/update-program.contract';

class ContentController {
	public fetchCategories = async (
		request: FastifyRequest<{ Querystring: FetchCategoriesQuery }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<FetchCategoriesQueryHandler>('content.fetchCategoriesQueryHandler');
		const response = await handler.handle({
			name: request.query.name,
			slug: request.query.slug,
			isActive: request.query.isActive,
		});
		return reply.send({
			message: 'Categories fetched successfully',
			data: response.categories,
		});
	};

	public addCategory = async (request: FastifyRequest<{ Body: AddCategoryBody }>, reply: FastifyReply) => {
		const handler = request.container.resolve<AddCategoryCommandHandler>('content.addCategoryCommandHandler');
		const response = await handler.execute({
			name: request.body.name,
			slug: request.body.slug,
			description: request.body.description,
			iconUrl: request.body.iconUrl,
			color: request.body.color,
			sortOrder: request.body.sortOrder,
		});
		return reply.code(201).send({
			message: 'Category created successfully',
			data: response.category,
		});
	};

	public updateCategory = async (
		request: FastifyRequest<{ Body: UpdateCategoryBody; Params: UpdateCategoryParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<UpdateCategoryCommandHandler>('content.updateCategoryCommandHandler');
		await handler.execute({
			id: request.params.id,
			...request.body,
		});
		return reply.send({
			message: 'Category updated successfully',
		});
	};

	public toggleCategoryStatus = async (
		request: FastifyRequest<{ Params: ToggleCategoryParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<ToggleCategoryStatusCommandHandler>(
			'content.toggleCategoryStatusCommandHandler',
		);
		await handler.execute({
			id: request.params.id,
		});
		return reply.send({
			message: 'Category updated successfully',
		});
	};

	public fetchPrograms = async (request: FastifyRequest<{ Querystring: FetchProgramsQuery }>, reply: FastifyReply) => {
		const handler = request.container.resolve<FetchProgramsQueryHandler>('content.fetchProgramsQueryHandler');
		const response = await handler.handle({
			title: request.query.title,
			type: request.query.type,
			status: request.query.status,
			slug: request.query.slug,
			categoryId: request.query.categoryId,
		});
		return reply.send({
			message: 'Programs fetched successfully',
			data: response.programs,
		});
	};

	public fetchProgram = async (request: FastifyRequest<{ Params: FetchProgramParams }>, reply: FastifyReply) => {
		const handler = request.container.resolve<FetchProgramQueryHandler>('content.fetchProgramQueryHandler');
		const response = await handler.handle({
			id: request.params.id,
		});
		return reply.send({
			message: 'Program fetched successfully',
			data: response.program,
		});
	};

	public addProgram = async (request: FastifyRequest<{ Body: AddProgramBody }>, reply: FastifyReply) => {
		const handler = request.container.resolve<AddProgramCommandHandler>('content.addProgramCommandHandler');
		const response = await handler.execute({
			title: request.body.title,
			description: request.body.description,
			slug: request.body.slug,
			type: request.body.type,
			shortDescription: request.body.shortDescription,
			categoryId: request.body.categoryId,
			thumbnailUrl: request.body.thumbnailUrl,
			bannerUrl: request.body.bannerUrl,
		});
		return reply.code(201).send({
			message: 'Program created successfully',
			data: response.program,
		});
	};

	public updateProgram = async (
		request: FastifyRequest<{ Body: UpdateProgramBody; Params: UpdateProgramParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<UpdateProgramCommandHandler>('content.updateProgramCommandHandler');
		await handler.execute({
			id: request.params.id,
			title: request.body.title,
			description: request.body.description,
			shortDescription: request.body.shortDescription,
			slug: request.body.slug,
			type: request.body.type,
			categoryId: request.body.categoryId,
			thumbnailUrl: request.body.thumbnailUrl,
			bannerUrl: request.body.bannerUrl,
		});
		return reply.send({
			message: 'Program updated successfully',
		});
	};

	public publishProgram = async (request: FastifyRequest<{ Params: PublishProgramParams }>, reply: FastifyReply) => {
		const handler = request.container.resolve<PublishProgramCommandHandler>('content.publishProgramCommandHandler');
		await handler.execute({
			id: request.params.id,
		});
		return reply.send({
			message: 'Program published successfully',
		});
	};

	public unpublishProgram = async (
		request: FastifyRequest<{ Params: UnpublishProgramParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<UnpublishProgramCommandHandler>('content.unpublishProgramCommandHandler');
		await handler.execute({
			id: request.params.id,
		});
		return reply.send({
			message: 'Program unpublished successfully',
		});
	};

	public scheduleProgram = async (
		request: FastifyRequest<{ Body: ScheduleProgramBody; Params: ScheduleProgramParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<ScheduleProgramCommandHandler>('content.scheduleProgramCommandHandler');
		await handler.execute({
			id: request.params.id,
			scheduledPublishAt: new Date(request.body.scheduledPublishAt),
		});
		return reply.send({
			message: 'Program scheduled successfully',
		});
	};

	public fetchEpisodes = async (request: FastifyRequest<{ Querystring: FetchEpisodesQuery }>, reply: FastifyReply) => {
		const handler = request.container.resolve<FetchEpisodesQueryHandler>('content.fetchEpisodesQueryHandler');
		const response = await handler.handle({
			title: request.query.title,
			status: request.query.status,
			slug: request.query.slug,
			programId: request.query.programId,
		});
		return reply.send({
			message: 'Episodes fetched successfully',
			data: response.episodes,
		});
	};

	public fetchEpisode = async (request: FastifyRequest<{ Params: FetchEpisodeParams }>, reply: FastifyReply) => {
		const handler = request.container.resolve<FetchEpisodeQueryHandler>('content.fetchEpisodeQueryHandler');
		const response = await handler.handle({
			id: request.params.id,
		});
		return reply.send({
			message: 'Episode fetched successfully',
			data: response.episode,
		});
	};

	public addEpisode = async (request: FastifyRequest<{ Body: AddEpisodeBody }>, reply: FastifyReply) => {
		const handler = request.container.resolve<AddEpisodeCommandHandler>('content.addEpisodeCommandHandler');
		const response = await handler.execute({
			title: request.body.title,
			description: request.body.description,
			slug: request.body.slug,
			programId: request.body.programId,
			episodeNumber: request.body.episodeNumber,
			durationSeconds: request.body.duration,
			shortDescription: request.body.shortDescription,
			seasonNumber: request.body.seasonNumber,
			thumbnailUrl: request.body.thumbnailUrl,
		});
		return reply.code(201).send({
			message: 'Episode created successfully',
			data: response.episode,
		});
	};

	public updateEpisode = async (
		request: FastifyRequest<{ Body: UpdateEpisodeBody; Params: UpdateEpisodeParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<UpdateEpisodeCommandHandler>('content.updateEpisodeCommandHandler');
		await handler.execute({
			id: request.params.id,
			title: request.body.title,
			description: request.body.description,
			slug: request.body.slug,
			programId: request.body.programId,
			episodeNumber: request.body.episodeNumber,
			durationSeconds: request.body.duration,
			shortDescription: request.body.shortDescription,
			seasonNumber: request.body.seasonNumber,
			thumbnailUrl: request.body.thumbnailUrl,
		});
		return reply.send({
			message: 'Episode updated successfully',
		});
	};

	public publishEpisode = async (request: FastifyRequest<{ Params: PublishEpisodeParams }>, reply: FastifyReply) => {
		const handler = request.container.resolve<PublishEpisodeCommandHandler>('content.publishEpisodeCommandHandler');
		await handler.execute({
			id: request.params.id,
		});
		return reply.send({
			message: 'Episode published successfully',
		});
	};

	public unpublishEpisode = async (
		request: FastifyRequest<{ Params: UnpublishEpisodeParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<UnpublishEpisodeCommandHandler>('content.unpublishEpisodeCommandHandler');
		await handler.execute({
			id: request.params.id,
		});
		return reply.send({
			message: 'Episode unpublished successfully',
		});
	};

	public addEpisodeMedia = async (
		request: FastifyRequest<{ Params: AddEpisodeMediaParams; Body: AddEpisodeMediaBody }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<AddEpisodeMediaCommandHandler>('content.addEpisodeMediaCommandHandler');
		const response = await handler.execute({
			episodeId: request.params.episodeId,
			...request.body,
		});
		return reply.code(201).send({
			message: 'Media added to episode successfully',
			data: response,
		});
	};
}

export default ContentController;
