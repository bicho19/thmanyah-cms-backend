import type { FastifyInstance, RouteOptions } from 'fastify';

export interface Routes {
	path: string;
	initializeRoutes: (fastify: FastifyInstance, opts?: RouteOptions) => Promise<void> | void;
}
