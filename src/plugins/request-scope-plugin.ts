import { type EntityManager, RequestContext } from '@mikro-orm/core';
import { asValue } from 'awilix';
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ContainerInfraKeys } from '@/infra/constants';
import type { AppContainer } from '@/lib/app-container';
import { asyncContext } from '@/lib/async-context';
import type { AppLogger } from '@/types/common';

const requestScopePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.addHook('onRequest', (request: FastifyRequest, _reply: FastifyReply, done: (err?: Error) => void) => {
		// Create a new scope for this request from the main container
		const scope = fastify.container.createScope();

		// Resolve the main logger to use as a base
		const mainLogger = scope.resolve<AppLogger>(ContainerInfraKeys.LOGGER);

		// Create a child logger with the request's correlationId
		// Pino's .child() method is highly efficient for this.
		const requestLogger = mainLogger.child({
			correlationId: request.id,
		});

		/* ── NEW: fork EntityManager for this request ───────────── */
		const emFactory = fastify.container.resolve<() => EntityManager>(ContainerInfraKeys.DATABASE_EM_FACTORY);
		const em = emFactory(); // fork()

		scope.register({
			[ContainerInfraKeys.DATABASE_EM]: asValue(em),
		});

		// Register the new request-scoped logger into the new scope.
		// It will override the registration for the main logger *within this scope only*.
		scope.register({
			[ContainerInfraKeys.LOGGER]: asValue(requestLogger),
		});

		// Attach the scoped container to the request object
		request.container = scope as AppContainer;

		request.container = scope as AppContainer;

		// THIS IS THE NEW PART
		// 1. We run everything inside our `asyncContext`. This makes the `scope` available.
		// 2. Inside, we use MikroORM's `RequestContext` helper. It creates a new context
		//    for the forked EntityManager and then calls `done` to continue the request.
		asyncContext.run({ container: scope as AppContainer }, () => {
			RequestContext.create(em, done);
		});
	});

	/* Flush & dispose when the response finishes */
	fastify.addHook('onResponse', async (request) => {
		// skip OPTIONS / requests without container
		if (!request.container) return;

		// clean up the container
		await request.container.dispose();
	});
};

export default fp(requestScopePlugin);
