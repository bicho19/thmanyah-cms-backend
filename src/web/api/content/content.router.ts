import type { FastifyInstance } from 'fastify';
import type { Routes } from '@/common/interfaces/routes.interface';
import { AddCategoryContract } from '@/web/api/content/api-contract/add-category.contract';
import { AddEpisodeContract } from '@/web/api/content/api-contract/add-episode.contract';
import { AddEpisodeMediaContract } from '@/web/api/content/api-contract/add-episode-media.contract';
import { AddProgramContract } from '@/web/api/content/api-contract/add-program.contract';
import { FetchCategoriesContract } from '@/web/api/content/api-contract/fetch-categories.contract';
import { FetchEpisodeContract } from '@/web/api/content/api-contract/fetch-episode.contract';
import { FetchEpisodesContract } from '@/web/api/content/api-contract/fetch-episodes.contract';
import { FetchProgramContract } from '@/web/api/content/api-contract/fetch-program.contract';
import { FetchProgramsContract } from '@/web/api/content/api-contract/fetch-programs.contract';
import { PublishEpisodeContract } from '@/web/api/content/api-contract/publish-episode.contract';
import { PublishProgramContract } from '@/web/api/content/api-contract/publish-program.contract';
import { ScheduleProgramContract } from '@/web/api/content/api-contract/schedule-program.contract';
import { ToggleCategoryContract } from '@/web/api/content/api-contract/toggle-category-status.contract';
import { UnpublishEpisodeContract } from '@/web/api/content/api-contract/unpublish-episode.contract';
import { UnpublishProgramContract } from '@/web/api/content/api-contract/unpublish-program.contract';
import { UpdateCategoryContract } from '@/web/api/content/api-contract/update-category.contract';
import { UpdateEpisodeContract } from '@/web/api/content/api-contract/update-episode.contract';
import { UpdateProgramContract } from '@/web/api/content/api-contract/update-program.contract';
import ContentController from '@/web/api/content/content.controller';

class ContentRouter implements Routes {
	public path = '/content';

	public contentController = new ContentController();

	public async initializeRoutes(fastify: FastifyInstance) {
		fastify.route({
			method: 'get',
			url: `${this.path}/categories`,
			preHandler: [fastify.authenticateUser],
			schema: FetchCategoriesContract,
			handler: this.contentController.fetchCategories,
		});

		fastify.route({
			method: 'post',
			url: `${this.path}/categories`,
			preHandler: [fastify.authenticateUser],
			schema: AddCategoryContract,
			handler: this.contentController.addCategory,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/categories/:id`,
			preHandler: [fastify.authenticateUser],
			schema: UpdateCategoryContract,
			handler: this.contentController.updateCategory,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/categories/:id/status`,
			preHandler: [fastify.authenticateUser],
			schema: ToggleCategoryContract,
			handler: this.contentController.toggleCategoryStatus,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/programs`,
			preHandler: [fastify.authenticateUser],
			schema: FetchProgramsContract,
			handler: this.contentController.fetchPrograms,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/programs/:id`,
			preHandler: [fastify.authenticateUser],
			schema: FetchProgramContract,
			handler: this.contentController.fetchProgram,
		});

		fastify.route({
			method: 'post',
			url: `${this.path}/programs`,
			preHandler: [fastify.authenticateUser],
			schema: AddProgramContract,
			handler: this.contentController.addProgram,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/programs/:id`,
			preHandler: [fastify.authenticateUser],
			schema: UpdateProgramContract,
			handler: this.contentController.updateProgram,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/programs/:id/publish`,
			preHandler: [fastify.authenticateUser],
			schema: PublishProgramContract,
			handler: this.contentController.publishProgram,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/programs/:id/unpublish`,
			preHandler: [fastify.authenticateUser],
			schema: UnpublishProgramContract,
			handler: this.contentController.unpublishProgram,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/programs/:id/schedule`,
			preHandler: [fastify.authenticateUser],
			schema: ScheduleProgramContract,
			handler: this.contentController.scheduleProgram,
		});

		// EPISODES routes
		fastify.route({
			method: 'get',
			url: `${this.path}/episodes`,
			preHandler: [fastify.authenticateUser],
			schema: FetchEpisodesContract,
			handler: this.contentController.fetchEpisodes,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/episodes/:id`,
			preHandler: [fastify.authenticateUser],
			schema: FetchEpisodeContract,
			handler: this.contentController.fetchEpisode,
		});

		fastify.route({
			method: 'post',
			url: `${this.path}/episodes`,
			preHandler: [fastify.authenticateUser],
			schema: AddEpisodeContract,
			handler: this.contentController.addEpisode,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/episodes/:id`,
			preHandler: [fastify.authenticateUser],
			schema: UpdateEpisodeContract,
			handler: this.contentController.updateEpisode,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/episodes/:id/publish`,
			preHandler: [fastify.authenticateUser],
			schema: PublishEpisodeContract,
			handler: this.contentController.publishEpisode,
		});

		fastify.route({
			method: 'put',
			url: `${this.path}/episodes/:id/unpublish`,
			preHandler: [fastify.authenticateUser],
			schema: UnpublishEpisodeContract,
			handler: this.contentController.unpublishEpisode,
		});

		fastify.route({
			method: 'post',
			url: `${this.path}/episodes/:episodeId/media`,
			preHandler: [fastify.authenticateUser],
			schema: AddEpisodeMediaContract,
			handler: this.contentController.addEpisodeMedia,
		});
	}
}

export default ContentRouter;
