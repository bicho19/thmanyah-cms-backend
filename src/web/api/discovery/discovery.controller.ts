import type { FastifyReply, FastifyRequest } from 'fastify';
import type FetchDiscoveryCategoriesQueryHandler from '@/modules/discovery/use-cases/fetch-discovery-categories/fetch-discovery-categories-query-handler';
import type FetchDiscoveryProgramsQueryHandler from '@/modules/discovery/use-cases/fetch-discovery-programs/fetch-discovery-programs-query-handler';
import type FetchProgramDetailsQueryHandler from '@/modules/discovery/use-cases/fetch-program-details/fetch-program-details-query-handler';
import type FetchProgramEpisodesQueryHandler from '@/modules/discovery/use-cases/fetch-program-episodes/fetch-program-episodes-query-handler';
import type { FetchDiscoveryProgramsQuery } from '@/web/api/discovery/api-contract/fetch-discovery-programs.contract';
import type { FetchProgramDetailsParams } from '@/web/api/discovery/api-contract/fetch-program-details.contract';
import type {
	FetchProgramEpisodesParams,
	FetchProgramEpisodesQuery,
} from '@/web/api/discovery/api-contract/fetch-program-episodes.contract';

class DiscoveryController {
	public fetchCategories = async (request: FastifyRequest, reply: FastifyReply) => {
		const handler = request.container.resolve<FetchDiscoveryCategoriesQueryHandler>(
			'discovery.fetchDiscoveryCategoriesQueryHandler',
		);
		const response = await handler.handle({});

		return reply.send({
			message: 'Discovery categories fetched successfully',
			data: response,
		});
	};

	public fetchPrograms = async (
		request: FastifyRequest<{ Querystring: FetchDiscoveryProgramsQuery }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<FetchDiscoveryProgramsQueryHandler>(
			'discovery.fetchDiscoveryProgramsQueryHandler',
		);

		const { page, limit } = request.query;

		const response = await handler.handle({
			page,
			limit,
			sortBy: 'publishedAt', // Default sort order
		});

		return reply.send({
			message: 'Discovery programs fetched successfully',
			data: response,
		});
	};

	public fetchProgramDetails = async (
		request: FastifyRequest<{ Params: FetchProgramDetailsParams }>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<FetchProgramDetailsQueryHandler>(
			'discovery.fetchProgramDetailsQueryHandler',
		);

		const { slug } = request.params;

		const response = await handler.handle({ slug });

		return reply.send({
			message: 'Program details fetched successfully',
			data: response,
		});
	};

	public fetchProgramEpisodes = async (
		request: FastifyRequest<{
			Params: FetchProgramEpisodesParams;
			Querystring: FetchProgramEpisodesQuery;
		}>,
		reply: FastifyReply,
	) => {
		const handler = request.container.resolve<FetchProgramEpisodesQueryHandler>(
			'discovery.fetchProgramEpisodesQueryHandler',
		);

		const { slug } = request.params;
		const { page, limit } = request.query;

		const response = await handler.handle({
			programSlug: slug,
			page,
			limit,
		});

		console.log(response);

		return reply.send({
			message: 'Discovery program episodes fetched successfully',
			data: response,
		});
	};
}

export default DiscoveryController;
