import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { ProgramSchema } from '@/web/common/schema/program.schema';

export const FetchDiscoveryProgramsSchema = {
	type: 'object',
	properties: {
		page: { type: 'number', default: 1 },
		limit: { type: 'number', default: 10 },
	},
} as const satisfies JSONSchema;

export type FetchDiscoveryProgramsQuery = FromSchema<typeof FetchDiscoveryProgramsSchema>;

export const FetchDiscoveryProgramsContract: FastifySchema = {
	description: 'Fetch discovery programs with pagination',
	summary: 'Fetch discovery programs',
	tags: ['Discovery'],
	querystring: FetchDiscoveryProgramsSchema,
	response: {
		200: {
			description: 'Successful get response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						items: {
							type: 'array',
							items: ProgramSchema,
						},
						meta: {
							type: 'object',
							properties: {
								total: { type: 'number' },
								page: { type: 'number' },
								limit: { type: 'number' },
								totalPages: { type: 'number' },
							},
						},
					},
				},
			},
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
