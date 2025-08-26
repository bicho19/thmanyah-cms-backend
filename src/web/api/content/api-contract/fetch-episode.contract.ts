import type { FastifySchema } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { EpisodeSchema } from '@/web/common/schema/espisode.schema';

export const FetchEpisodeParams = {
	type: 'object',
	required: ['id'],
	properties: {
		id: {
			type: 'string',
			nullable: false,
			minLength: 26,
		},
	},
	additionalProperties: false,
} as const;

export type FetchEpisodeParams = FromSchema<typeof FetchEpisodeParams>;

export const FetchEpisodeContract: FastifySchema = {
	summary: 'Get a single episode',
	description: 'Get a single episode by its ID',
	tags: ['Episodes'],
	params: FetchEpisodeParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: EpisodeSchema,
			},
		},
		400: {
			description: 'Bad request (Validation error)',
			...validationErrorResponseSchema,
		},
		404: {
			description: 'Episode Not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
