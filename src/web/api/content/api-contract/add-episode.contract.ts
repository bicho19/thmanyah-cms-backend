import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { EpisodeSchema } from '@/web/common/schema/espisode.schema';

export const AddEpisodeSchema = {
	type: 'object',
	required: ['title', 'description', 'slug', 'programId', 'episodeNumber', 'duration'],
	properties: {
		title: { type: 'string', minLength: 3 },
		description: { type: 'string', minLength: 5 },
		slug: { type: 'string', minLength: 1 },
		programId: {
			type: 'string',
			minLength: 26, // matches the ulid format
		},
		episodeNumber: { type: 'number', minimum: 0 },
		duration: { type: 'number', minimum: 1 },
		shortDescription: { type: 'string', nullable: true },
		seasonNumber: { type: 'number', nullable: true },
		thumbnailUrl: { type: 'string', nullable: true },
	},
} as const satisfies JSONSchema;

export type AddEpisodeBody = FromSchema<typeof AddEpisodeSchema>;

export const AddEpisodeContract: FastifySchema = {
	description: 'Add a new episode',
	summary: 'Add a new episode',
	tags: ['Episodes'],
	body: AddEpisodeSchema,
	response: {
		201: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: EpisodeSchema,
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
		409: {
			description: 'Conflict (Slug already exists)',
		},
	},
};
