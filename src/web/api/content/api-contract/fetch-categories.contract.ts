import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { CategorySchema } from '@/web/common/schema/category.schema';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';

export const FetchCategoriesSchema = {
	type: 'object',
	properties: {
		name: {
			type: 'string',
			nullable: true,
		},
		slug: {
			type: 'string',
			nullable: true,
		},
		isActive: {
			type: 'boolean',
			nullable: true,
		},
	},
} as const satisfies JSONSchema;

export type FetchCategoriesQuery = FromSchema<typeof FetchCategoriesSchema>;

export const FetchCategoriesContract: FastifySchema = {
	description: 'Fetch categories',
	summary: 'Fetch categories',
	tags: ['Categories'],
	querystring: FetchCategoriesSchema,
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
