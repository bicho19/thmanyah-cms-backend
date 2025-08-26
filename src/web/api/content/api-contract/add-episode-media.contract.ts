import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { MediaSchema } from '@/web/common/schema/media.schema';

export const AddEpisodeMediaParamsSchema = {
	type: 'object',
	properties: {
		episodeId: { type: 'string' },
	},
	required: ['episodeId'],
} as const satisfies JSONSchema;

export const AddEpisodeMediaBodySchema = {
	type: 'object',
	required: ['type', 'url', 'source'],
	properties: {
		type: { type: 'string', enum: ['video', 'audio'] },
		url: { type: 'string', format: 'uri' },
		source: { type: 'string', enum: ['upload', 'youtube', 'spotify', 'external'] },
		mimeType: { type: 'string' },
		qualityLabel: { type: 'string' },
		fileSizeBytes: { type: 'number' },
		sortOrder: { type: 'number', default: 0 },
	},
} as const satisfies JSONSchema;

export type AddEpisodeMediaParams = FromSchema<typeof AddEpisodeMediaParamsSchema>;
export type AddEpisodeMediaBody = FromSchema<typeof AddEpisodeMediaBodySchema>;

export const AddEpisodeMediaContract: FastifySchema = {
	description: 'Add a new media file to an episode',
	summary: 'Add Episode Media',
	tags: ['Episodes'],
	params: AddEpisodeMediaParamsSchema,
	body: AddEpisodeMediaBodySchema,
	response: {
		201: {
			description: 'Successful creation',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: MediaSchema,
			},
		},
		404: {
			description: 'Episode not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
