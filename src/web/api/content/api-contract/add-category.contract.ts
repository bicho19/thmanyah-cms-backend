import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { CategorySchema } from '@/web/common/schema/category.schema';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const AddCategorySchema = {
	type: 'object',
	required: ['name', 'slug'],
	properties: {
		name: { type: 'string' },
		slug: { type: 'string' },
		description: { type: 'string', nullable: true },
		iconUrl: { type: 'string', nullable: true },
		color: { type: 'string', nullable: true },
		sortOrder: { type: 'number', nullable: true },
	},
} as const satisfies JSONSchema;

export type AddCategoryBody = FromSchema<typeof AddCategorySchema>;

export const AddCategoryContract: FastifySchema = {
	description: 'Add a new category',
	summary: 'Add a new category',
	tags: ['Categories'],
	body: AddCategorySchema,
	response: {
		201: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: CategorySchema,
			},
		},
		400: {
			description: 'Bad request (Validation failed)',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
