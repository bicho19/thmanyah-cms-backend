import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const PublishProgramParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type PublishProgramParams = FromSchema<typeof PublishProgramParams>;

export const PublishProgramContract = {
	summary: 'Publish a program',
	description: 'Publish a program',
	tags: ['Program'],
	params: PublishProgramParams,
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
			description: 'Program not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
