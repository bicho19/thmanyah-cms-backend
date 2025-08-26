import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const UpdateProgramSchema = {
	type: 'object',
	required: [],
	properties: {
		title: { type: 'string' },
		description: { type: 'string' },
		slug: { type: 'string' },
		type: { type: 'string', enum: ['podcast', 'documentary', 'interview'] },
		shortDescription: { type: 'string' },
		categoryId: { type: 'string' },
		thumbnailUrl: { type: 'string' },
		bannerUrl: { type: 'string' },
	},
	additionalProperties: false,
} as const;

export const UpdateProgramParams = {
	type: 'object',
	required: ['id'],
	properties: {
		id: {
			type: 'string',
			nullable: false,
			minLength: 26,
		},
	},
	additionalProperties: false,
} as const;

export type UpdateProgramBody = FromSchema<typeof UpdateProgramSchema>;
export type UpdateProgramParams = FromSchema<typeof UpdateProgramParams>;

export const UpdateProgramContract = {
	summary: 'Update a program',
	description: 'Update a program',
	tags: ['Program'],
	body: UpdateProgramSchema,
	params: UpdateProgramParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
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
