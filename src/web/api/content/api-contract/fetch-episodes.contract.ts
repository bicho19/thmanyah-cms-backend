import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { EpisodeSchema } from '@/web/common/schema/espisode.schema';

export const FetchEpisodesSchema = {
	type: 'object',
	properties: {
		title: { type: 'string', nullable: true },
		status: {
			type: 'string',
			enum: ['draft', 'scheduled', 'published', 'unpublished', 'archived', 'deleted'],
			nullable: true,
		},
		slug: { type: 'string', nullable: true },
		programId: { type: 'string', nullable: true },
	},
} as const satisfies JSONSchema;

export type FetchEpisodesQuery = FromSchema<typeof FetchEpisodesSchema>;

export const FetchEpisodesContract: FastifySchema = {
	description: 'Fetch list of episodes',
	summary: 'Fetch episodes',
	tags: ['Episodes'],
	querystring: FetchEpisodesSchema,
	response: {
		200: {
			description: 'Successful get response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'array',
					items: EpisodeSchema,
				},
			},
		},
		400: {
			description: 'Bad request',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
