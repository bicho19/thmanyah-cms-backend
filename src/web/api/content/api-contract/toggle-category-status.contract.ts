import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const ToggleCategoryParams = {
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'string' },
	},
	additionalProperties: false,
} as const;

export type ToggleCategoryParams = FromSchema<typeof ToggleCategoryParams>;

export const ToggleCategoryContract = {
	summary: 'Toggle category status',
	description: 'Toggles the active/inactive status of a category',
	tags: ['Categories'],
	params: ToggleCategoryParams,
	response: {
		200: {
			description: 'Successful toggle',
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
