import type { FastifyInstance } from 'fastify';
import type { Routes } from '@/common/interfaces/routes.interface';
import { FetchDiscoveryCategoriesContract } from '@/web/api/discovery/api-contract/fetch-discovery-categories.contract';
import { FetchDiscoveryProgramsContract } from '@/web/api/discovery/api-contract/fetch-discovery-programs.contract';
import { FetchProgramDetailsContract } from '@/web/api/discovery/api-contract/fetch-program-details.contract';
import { FetchProgramEpisodesContract } from '@/web/api/discovery/api-contract/fetch-program-episodes.contract';
import DiscoveryController from '@/web/api/discovery/discovery.controller';

class DiscoveryRouter implements Routes {
	public path = '/discovery';

	public discoveryController = new DiscoveryController();

	public async initializeRoutes(fastify: FastifyInstance) {
		fastify.route({
			method: 'get',
			url: `${this.path}/categories`,
			schema: FetchDiscoveryCategoriesContract,
			handler: this.discoveryController.fetchCategories,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/programs`,
			schema: FetchDiscoveryProgramsContract,
			handler: this.discoveryController.fetchPrograms,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/programs/:slug`,
			schema: FetchProgramDetailsContract,
			handler: this.discoveryController.fetchProgramDetails,
		});

		fastify.route({
			method: 'get',
			url: `${this.path}/programs/:slug/episodes`,
			schema: FetchProgramEpisodesContract,
			handler: this.discoveryController.fetchProgramEpisodes,
		});
	}
}

export default DiscoveryRouter;
