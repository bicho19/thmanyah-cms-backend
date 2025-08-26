import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const ScheduleImportBodySchema = {
	type: 'object',
	required: ['url', 'programId'],
	properties: {
		url: { type: 'string', format: 'uri', description: 'The URL of the program or channel to import.' },
		programId: {
			type: 'string',
			minLength: 26,
		},
	},
} as const satisfies JSONSchema;

export type ScheduleImportBody = FromSchema<typeof ScheduleImportBodySchema>;

export const ScheduleImportContract: FastifySchema = {
	description: 'Schedules a new import job for a given URL.',
	summary: 'Schedule Program Import',
	tags: ['Importer'],
	body: ScheduleImportBodySchema,
	response: {
		200: {
			description: 'Import job accepted for processing',
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Bad request',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
