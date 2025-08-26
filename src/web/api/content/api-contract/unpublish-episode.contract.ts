import type { FastifySchema } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const UnpublishEpisodeParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type UnpublishEpisodeParams = FromSchema<typeof UnpublishEpisodeParams>;

export const UnpublishEpisodeContract: FastifySchema = {
	summary: 'Unpublish an episode',
	description: 'Unpublish an episode',
	tags: ['Episodes'],
	params: UnpublishEpisodeParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Bad request (Episode not found)',
			...validationErrorResponseSchema,
		},
		404: {
			description: 'Episode not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
