import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { CategorySchema } from '@/web/common/schema/category.schema';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';

export const FetchDiscoveryCategoriesSchema = {
	type: 'object',
	properties: {},
} as const satisfies JSONSchema;

export type FetchDiscoveryCategoriesQuery = FromSchema<typeof FetchDiscoveryCategoriesSchema>;

export const FetchDiscoveryCategoriesContract: FastifySchema = {
	description: 'Fetch discovery categories',
	summary: 'Fetch discovery categories',
	tags: ['Discovery'],
	querystring: FetchDiscoveryCategoriesSchema,
	response: {
		200: {
			description: 'Successful get response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'array',
					items: CategorySchema,
				},
			},
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
