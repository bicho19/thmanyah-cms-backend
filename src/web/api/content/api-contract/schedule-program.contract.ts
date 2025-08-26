import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const ScheduleProgramSchema = {
	type: 'object',
	properties: {
		scheduledPublishAt: { type: 'string', format: 'date-time' },
	},
	required: ['scheduledPublishAt'],
	additionalProperties: false,
} as const;

export const ScheduleProgramParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type ScheduleProgramBody = FromSchema<typeof ScheduleProgramSchema>;
export type ScheduleProgramParams = FromSchema<typeof ScheduleProgramParams>;

export const ScheduleProgramContract = {
	summary: 'Schedule a program for publishing',
	description: 'Schedule a program for publishing',
	tags: ['Program'],
	body: ScheduleProgramSchema,
	params: ScheduleProgramParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Bad request',
			...validationErrorResponseSchema,
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
