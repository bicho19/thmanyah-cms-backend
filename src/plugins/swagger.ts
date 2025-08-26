import fastifySwagger, { type FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifyInstance } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';

export const initSwagger = fastifyPlugin((fastify: FastifyInstance, _: unknown, done: () => void) => {
	const opts: FastifyDynamicSwaggerOptions = {
		mode: 'dynamic', // auto-generates API schemas from route schemas
		openapi: {
			info: {
				title: 'Thmanyah CMS API',
				description:
					'Thmanyah CMS API provides a unified interface for authentication, content management, \n' +
					'and related operations.  \n' +
					'This documentation outlines all available endpoints, request/response structures, \n' +
					'and authentication methods for front developers integrating with the CMS.',
				version: '1.0.0',
			},
			tags: [
				{
					name: 'auth',
					description:
						'Authentication and authorization related endpoints.  \n' +
						'Use these APIs to log in, register users, refresh tokens, and manage sessions.',
				},
				{
					name: 'content/programs',
					description:
						'Endpoints for managing CMS content.  \n' +
						'These APIs allow developers to:\n' +
						'- Create, update, and delete programs and episodes  \n' +
						'- Retrieve published or draft content  \n' +
						'- Manage metadata, attachments, and media resources ',
				},
				{
					name: 'content/episodes',
					description:
						'Endpoints for managing CMS content.  \n' +
						'These APIs allow developers to:\n' +
						'- Create, update, and delete programs and episodes  \n' +
						'- Retrieve published or draft content  \n' +
						'- Manage metadata, attachments, and media resources ',
				},
				{
					name: 'discovery',
					description: `
Endpoints for content discovery and public access.
These APIs are optimized for:
- Browsing available programs and episodes
- Searching and filtering content by category, tags, or keywords
- Exposing curated and recommended content to users
        `.trim(),
				},
			],
			security: [],
		},
	};

	fastify.register(fastifySwagger, opts);
	done();
});
