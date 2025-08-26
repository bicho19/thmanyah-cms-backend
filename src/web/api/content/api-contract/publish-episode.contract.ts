import type { FastifySchema } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const PublishEpisodeParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type PublishEpisodeParams = FromSchema<typeof PublishEpisodeParams>;

export const PublishEpisodeContract: FastifySchema = {
	summary: 'Publish an episode',
	description: 'Publish an episode',
	tags: ['Episodes'],
	params: PublishEpisodeParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Bad request',
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
