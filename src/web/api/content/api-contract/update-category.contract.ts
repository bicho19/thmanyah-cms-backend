import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const UpdateCategorySchema = {
	type: 'object',
	required: [],
	properties: {
		name: { type: 'string' },
		slug: { type: 'string' },
		description: { type: 'string' },
		iconUrl: { type: 'string' },
		color: { type: 'string' },
		sortOrder: { type: 'number' },
	},
	additionalProperties: false,
} as const;

export const UpdateCategoryParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type UpdateCategoryBody = FromSchema<typeof UpdateCategorySchema>;
export type UpdateCategoryParams = FromSchema<typeof UpdateCategoryParams>;

export const UpdateCategoryContract = {
	summary: 'Update a category',
	description: 'Update a category',
	tags: ['Categories'],
	body: UpdateCategorySchema,
	params: UpdateCategoryParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
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
