import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { ProgramSchema } from '@/web/common/schema/program.schema';

export const FetchProgramDetailsSchema = {
	type: 'object',
	properties: {
		slug: { type: 'string' },
	},
	required: ['slug'],
} as const satisfies JSONSchema;

export type FetchProgramDetailsParams = FromSchema<typeof FetchProgramDetailsSchema>;

export const FetchProgramDetailsContract: FastifySchema = {
	description: 'Fetch a single program by slug',
	summary: 'Fetch program details',
	tags: ['Discovery'],
	params: FetchProgramDetailsSchema,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: ProgramSchema,
			},
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
