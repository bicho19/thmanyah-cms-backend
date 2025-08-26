import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { ProgramSchema } from '@/web/common/schema/program.schema';

export const AddProgramSchema = {
	type: 'object',
	required: ['title', 'description', 'slug', 'type', 'categoryId'],
	properties: {
		title: { type: 'string', minLength: 1 },
		description: { type: 'string', minLength: 5 },
		slug: { type: 'string', minLength: 1 },
		type: { type: 'string', enum: ['podcast', 'documentary', 'interview'] },
		categoryId: { type: 'string', minLength: 1 },
		shortDescription: { type: 'string', nullable: true },
		thumbnailUrl: { type: 'string', nullable: true },
		bannerUrl: { type: 'string', nullable: true },
	},
} as const satisfies JSONSchema;

export type AddProgramBody = FromSchema<typeof AddProgramSchema>;

export const AddProgramContract: FastifySchema = {
	description: 'Add a new program',
	summary: 'Add a new program',
	tags: ['Program'],
	body: AddProgramSchema,
	response: {
		201: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: ProgramSchema,
			},
		},
		400: {
			description: 'Bad request',
			...validationErrorResponseSchema,
		},
		404: {
			description: 'Category not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
