import type { FastifySchema } from 'fastify';
import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { ProgramSchema } from '@/web/common/schema/program.schema';

export const FetchProgramParams = {
	type: 'object',
	required: ['id'],
	properties: {
		id: {
			type: 'string',
			nullable: false,
			minLength: 26, // matches the ulid length
		},
	},
	additionalProperties: false,
} as const;

export type FetchProgramParams = FromSchema<typeof FetchProgramParams>;

export const FetchProgramContract: FastifySchema = {
	summary: 'Get a single program',
	description: 'Get a single program by its ID',
	tags: ['Program'],
	params: FetchProgramParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: ProgramSchema,
			},
		},
		400: {
			description: 'Bad request (Validation error)',
			...validationErrorResponseSchema,
		},
		404: {
			description: 'Program Not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
