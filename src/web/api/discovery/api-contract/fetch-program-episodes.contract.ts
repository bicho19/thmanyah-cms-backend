import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { EpisodeSchema } from '@/web/common/schema/espisode.schema';

export const FetchProgramEpisodesParamsSchema = {
	type: 'object',
	properties: {
		slug: { type: 'string' },
	},
	required: ['slug'],
} as const satisfies JSONSchema;

export const FetchProgramEpisodesQuerySchema = {
	type: 'object',
	properties: {
		page: { type: 'number', default: 1 },
		limit: { type: 'number', default: 10 },
	},
} as const satisfies JSONSchema;

export type FetchProgramEpisodesParams = FromSchema<typeof FetchProgramEpisodesParamsSchema>;
export type FetchProgramEpisodesQuery = FromSchema<typeof FetchProgramEpisodesQuerySchema>;

export const FetchProgramEpisodesContract: FastifySchema = {
	description: 'Fetch the episodes for a given program',
	summary: 'Fetch program episodes',
	tags: ['Discovery'],
	params: FetchProgramEpisodesParamsSchema,
	querystring: FetchProgramEpisodesQuerySchema,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						items: {
							type: 'array',
							items: EpisodeSchema,
						},
						meta: {
							type: 'object',
							properties: {
								total: { type: 'number' },
								page: { type: 'number' },
								limit: { type: 'number' },
								totalPages: { type: 'number' },
							},
							required: ['total', 'page', 'limit', 'totalPages'],
						},
					},
					required: ['items', 'meta'],
				},
			},
			required: ['message', 'data'],
		},
		404: {
			description: 'Program not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
