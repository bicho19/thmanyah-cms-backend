import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { ProgramSchema } from '@/web/common/schema/program.schema';

export const FetchProgramsSchema = {
	type: 'object',
	properties: {
		title: { type: 'string', nullable: true },
		type: { type: 'string', enum: ['podcast', 'documentary', 'interview'], nullable: true },
		status: {
			type: 'string',
			enum: ['draft', 'scheduled', 'published', 'unpublished', 'archived', 'deleted'],
			nullable: true,
		},
		slug: { type: 'string', nullable: true },
		categoryId: { type: 'string', nullable: true },
	},
} as const satisfies JSONSchema;

export type FetchProgramsQuery = FromSchema<typeof FetchProgramsSchema>;

export const FetchProgramsContract: FastifySchema = {
	description: 'Fetch programs',
	summary: 'Fetch programs',
	tags: ['Program'],
	querystring: FetchProgramsSchema,
	response: {
		200: {
			description: 'Successful get response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'array',
					items: ProgramSchema,
				},
			},
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
